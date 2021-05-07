pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "./BancorBondingCurve.sol";

contract ProductToken is ERC20, BancorBondingCurve {
	using SafeMath for uint256;

	event Buy(address indexed sender, uint32 amount, uint deposit);		// event to fire when a new token is minted
  event Sell(address indexed sender, uint32 amount, uint refund);			// event to fire when a token has been sold back
  event Tradein(address indexed sender, uint32 amount);									// event to fire when a token is redeemed in the real world

  // uint256 public basePrice;
  uint256 public reserveBalance;		// amount in ether, about 1/3 of a ether. This is initialized for testing, according to
                                                        // a pricing function of y = x ^ 2, at a token supply (x) of 1
  // uint32 public exponent;
  uint32 public reserveRatio;


  uint32 public maxTokenCount;
  uint32 public tradeinCount = 0;
  uint32 public supplyOffset;

  IERC20 dai;

	/**
   * @dev Constructor
   *
   * @param _daiAddress               the address of Dai, which is used as a payment option.
   * @param _reserveRatio             the reserve ratio in the curve function.
   * @param _maxTokenCount						the amount of token that will exist for this type.
   * @param _supplyOffset             this amount is used to determine initial price.
   * @param _baseReserve              the base amount of reserve tokens, in accordance to _supplyOffset.
   *
  */
  constructor(address _daiAddress, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) ERC20("ProductToken", "") public {		
  	require(_daiAddress!=address(0), "Invalid Dai token address");
    require(_maxTokenCount > 0, "Invalid max token count.");
    require(_reserveRatio > 0, "Invalid reserve ratio");

    dai = IERC20(_daiAddress);

    reserveBalance = _baseReserve;
    supplyOffset = _supplyOffset;
    reserveRatio = _reserveRatio;		// initialize the reserve ratio for this token in ppm. 
                                                                      // This is hardcoded right now because we are testing with 33%
    maxTokenCount = _maxTokenCount;
    // _mint(msg.sender, 1);  
  }

  /**
   * @dev When user wants to buy tokens from the pool
   *
  */
  // function buy() public payable {
  //   require(msg.value > 0, "Must send ether to buy tokens.");
  //   uint256 amount;
  //   uint256 change;    
  //   (amount, change) = _buyForAmount(msg.value.mul(960000).div(1000000)); // ppm of 96%. 4% is the platform transaction fee
  //   // return change back to the sender.
  //   if (amount > 0) {                                               // If token transaction went through successfully
    
  //     payable(msg.sender).transfer(change);
  //   }
  //   else {                                                          // If token transaction failed
    
  //     payable(msg.sender).transfer(msg.value);                                 
  //   }
  // }
  function buy(uint256 daiAmount) public {
    require(daiAmount > 0, "Value of dai must be greater than 0 to buy tokens.");
    // Has to ask user for approval here.
    // bool allowed = dai.approve(address(this), daiAmount);
    // require(allowed, "Purchase failed because transfer approval was denied.");
    
    bool success = dai.transferFrom(msg.sender, address(this), daiAmount);
    require(success, "Purchase failed, amount to buy token was not successfully transferred.");
    uint256 amount;
    uint256 change;
    (amount, change) = _buyForAmount(daiAmount.mul(960000).div(1000000)); // ppm of 96%. 4% is the platform transaction fee
    // return change back to the sender.
    if (amount > 0) {                                               // If token transaction went through successfully
      dai.transfer(msg.sender, change);
    }
    else {                                                          // If token transaction failed
      dai.transfer(msg.sender, daiAmount);                               
    }
  }

	/**
   * @dev When user wants to sell their tokens back to the pool
   *
  */
 	function sell(uint32 _amount) public {
    uint256 returnAmount = _sellForAmount(_amount);
    bool success = dai.transfer(msg.sender, returnAmount.mul(980000).div(1000000));        // ppm of 98%. 2% is the platform transaction fee
    require(success, "selling token failed");
  }

	/**
   * @dev When user wants to trade in their token for retail product
   * the logistics for transfering product should be handled elsewhere
   *
  */
  function tradein(uint32 _amount) public {
  	_tradeinForAmount(_amount);
  }

  fallback () external { }      // should reject any ether transfer since we don't take ether.

  // View Functions for outside.
  function getAvailability()
    public view returns (uint32 available)
  {
    return maxTokenCount - uint32(totalSupply()) - tradeinCount;    // add safemath for uint32 later
  }

  function getTotalSupply()
    internal view returns (uint32 supply)
  {
    return uint32(totalSupply().add(uint256(tradeinCount)).add(uint256(supplyOffset)));
  }

  // function getTradeinCount()                                         Don't need these, because public variable have getters by default
  //   public view returns (uint32 _amountTraded)
  // {
  //   return tradeinCount;
  // }

  // function getSupply()
  //   public view returns (uint32 maxToken)
  // {
  //   return maxTokenCount;
  // }

  function getCurrentPrice() 
  	public view returns	(uint256 price)
  {
  	return calculatePriceForNTokens(getTotalSupply(), reserveBalance, reserveRatio, 1);
  }

  function getPriceForN(uint32 _amountProduct) 
  	public view returns	(uint256 price)
  {
  	return calculatePriceForNTokens(getTotalSupply(), reserveBalance, reserveRatio, _amountProduct);
  }

  function calculateBuyReturn(uint256 _amountReserve)
    public view returns (uint32 mintAmount)
  {
    return calculatePurchaseReturn(getTotalSupply(), reserveBalance, reserveRatio, _amountReserve);
  }

  function calculateSellReturn(uint32 _amountProduct)
    public view returns (uint256 soldAmount)
  {
    return calculateSaleReturn(getTotalSupply(), reserveBalance, reserveRatio, _amountProduct);
  }

  // specific implementations of transaction logics.
   /**
   * @dev calculates the return for a given conversion (in product token) 
   * This function will try to compute the amount of tokens one can buy first, 
   * then it will initiate a transfer and for any extras, return as change.
   * if any tokens purchases are confirmed, it will update ownerTokenCount mappin. 
   *
   * @param _deposit              reserve total deposited
   *
   * @return token                amount bought in product token
  */
  function _buyForAmount(uint256 _deposit)
    internal returns (uint32, uint256)
  {
  	require(getAvailability() > 0, "Sorry, this token is sold out.");
    require(_deposit > 0, "Deposit must be non-zero.");

    uint32 amount = calculateBuyReturn(_deposit);	    // have to make it discrete here. Replace amount with uint32

    // If the amount in _deposit is more than enough to buy out the rest of the token in the pool
    if (amount > getAvailability()) {   // this logic can be refactored.
      amount = getAvailability();
    }

    uint256 actualDeposit = getPriceForN(amount);     // this currently does not account any transaction fee
    _mint(msg.sender, amount);
    reserveBalance = reserveBalance.add(actualDeposit);
    emit Buy(msg.sender, amount, actualDeposit);		// probably needs to be redesigned for ease of read and understanding.
    return (amount, _deposit.sub(actualDeposit));    // return amount of token bought and change
  }

   /**
   * @dev calculates the return for a given conversion (in the reserve token) 
   * This function will try to compute the amount of liquidity one gets by selling one token, 
   * then it will initiate a transfer.
   * said token then will be burned to reduce total supply, but won't be added to the tradeinCount variable 
   *
   * @param _amount              product token wishes to be sold
   *
   * @return token               amount sold in reserved token
  */
  function _sellForAmount(uint32 _amount)
    internal returns (uint256)
  {
  	require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to sell.");
    // calculate amount of liquidity to reimburse
  	uint256 reimburseAmount = calculateSellReturn(_amount);
 		reserveBalance = reserveBalance.sub(reimburseAmount);
    _burn(msg.sender, _amount);
    emit Sell(msg.sender, _amount, reimburseAmount);
    return reimburseAmount;
  }


   /**
   * @dev initiate token logics after a token is traded in. 
   * This function only handles logics corresponding to 
   *
   * @param _amount              product token wishes to be traded-in
  */
  function _tradeinForAmount(uint32 _amount)
    internal 
  {
    require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to burn.");

    _burn(msg.sender, _amount);
    tradeinCount = tradeinCount + _amount;			// Future: use safe math here.
    // To-do: provide revenue to vendor

    emit Tradein(msg.sender, _amount);
  }

  // To-do:
  // Need to design function to withdraw liquidity and return it to the owner.
  // All transfer functions here are vulnerable to the DDOS attack. Should implement “balance withdrawal” design pattern
      // On second thought, this should be ok.
  // Set gas price limit for front-running attack
  // Implement Ownable for Factory and Token logics
  // Implement Circuit breaker function
  // Consider gas cost in the refund logic.
  // Safemath 32
  // Split platform fees into bucket: 
  //    Buy 4%{ 
  //      1% merchant,
  //      1% Insurance,
  //      2% Platform staking
  //    }
  //    Sell 2%{
  //      1% insurance,
  //      1% Merchant
  //    }
  // Tradein to a pending process that does not burn the token until shipment verification is confirmed.
}
