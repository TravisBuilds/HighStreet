pragma solidity ^0.8.2;

// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./BancorBondingCurve.sol";
// import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";

contract ProductToken is ERC20Upgradeable, BancorBondingCurve, OwnableUpgradeable {
	using SafeMathUpgradeable for uint256;

	event Buy(address indexed sender, uint32 amount, uint deposit);		// event to fire when a new token is minted
  event Sell(address indexed sender, uint32 amount, uint refund);		// event to fire when a token has been sold back
  event Tradein(address indexed sender, uint32 amount);							// event to fire when a token is redeemed in the real world

  // uint256 public basePrice;
  uint256 public reserveBalance;		// amount in ether, about 1/3 of a ether. This is initialized for testing, according to
                                    // a pricing function of y = x ^ 2, at a token supply (x) of 1
  // uint32 public exponent;
  uint32 public reserveRatio;
  uint32 public maxTokenCount;
  uint32 public tradeinCount;
  uint32 internal supplyOffset;
  address public creator;

	/**
   * @dev Constructor
   *
   * @param _name                     the name of this token
   * @param _symbol                   the symbol of this token
   * @param _reserveRatio             the reserve ratio in the curve function.
   * @param _maxTokenCount						the amount of token that will exist for this type.
   * @param _supplyOffset             this amount is used to determine initial price.
   * @param _baseReserve              the base amount of reserve tokens, in accordance to _supplyOffset.
   *
  */
  function initialize(string memory _name, string memory _symbol, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) public initializer { //, address _daiAddress, address _chainlink) public initializer {
    __Ownable_init();
    __ERC20_init(_name, _symbol);
    __BancorBondingCurve_init();
    __ProductToken_init_unchained(_reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve);
  }

  function __ProductToken_init_unchained(uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) internal initializer { //, address _daiAddress, address _chainlink) public initializer {
    require(_maxTokenCount > 0, "Invalid max token count.");
    require(_reserveRatio > 0, "Invalid reserve ratio");

    reserveBalance = _baseReserve;
    supplyOffset = _supplyOffset;
    reserveRatio = _reserveRatio;   // initialize the reserve ratio for this token in ppm.
    maxTokenCount = _maxTokenCount;
  }

	/**
   * @dev When user wants to trade in their token for retail product
   * the logistics for transfering product should be handled elsewhere
   *
  */
  function tradein(uint32 _amount) public virtual {
  	_tradeinForAmount(_amount);
  }

  fallback () external { }      // should reject any ether transfer since we don't take ether.

  // View Functions for outside.
  function getAvailability()
    public view virtual returns (uint32 available)
  {
    return maxTokenCount - uint32(totalSupply()) - tradeinCount;    // add safemath for uint32 later
  }

  function getTotalSupply()
    internal view virtual returns (uint32 supply)
  {
    return uint32(totalSupply().add(uint256(tradeinCount)).add(uint256(supplyOffset)));
  }

  function getCurrentPrice() 
  	public view virtual returns	(uint256 price)
  {
  	return calculatePriceForNTokens(getTotalSupply(), reserveBalance, reserveRatio, 1);
  }

  function getPriceForN(uint32 _amountProduct) 
  	public view virtual returns	(uint256 price)
  {
  	return calculatePriceForNTokens(getTotalSupply(), reserveBalance, reserveRatio, _amountProduct);
  }

  function calculateBuyReturn(uint256 _amountReserve)
    public view virtual returns (uint32 mintAmount)
  {
    return calculatePurchaseReturn(getTotalSupply(), reserveBalance, reserveRatio, _amountReserve);
  }

  function calculateSellReturn(uint32 _amountProduct)
    public view virtual returns (uint256 soldAmount)
  {
    return calculateSaleReturn(getTotalSupply(), reserveBalance, reserveRatio, _amountProduct);
  }

   /**
   * @dev calculates the return for a given conversion (in product token) 
   * This function will try to compute the amount of tokens one can buy first, 
   * then it will initiate a transfer and for any extras, return as change.
   * if any tokens purchases are confirmed, it will update ownerTokenCount mappin. 
   *
   * @param _deposit              reserve total deposited
   * @param _amount               the amount of tokens to be bought.
   *
   * @return token                amount bought in product token
  */
  function _buyForAmount(uint256 _deposit, uint32 _amount)
    internal virtual returns (uint32, uint256)
  {
  	require(getAvailability() > 0, "Sorry, this token is sold out.");
    require(_deposit > 0, "Deposit must be non-zero.");
    // Special case, buy 0 tokens, return all fund back to user.
    if (_amount == 0) {
      return (0, _deposit);
    }

    uint32 amount;
    uint256 actualDeposit;

    // uint32 amount = calculateBuyReturn(_deposit);	    // have to make it discrete here. Replace amount with uint32

    // If the amount in _deposit is more than enough to buy out the rest of the token in the pool
    if (amount > getAvailability()) {   // this logic can be refactored.
      amount = getAvailability();
    }

    actualDeposit = getPriceForN(_amount);     // this currently does not account any transaction fee
    if (actualDeposit > _deposit) {   // if user deposited token is not enough to buy ideal amount. This is a fallback option.
      amount = calculateBuyReturn(_deposit);
      actualDeposit = getPriceForN(amount);
    } else {
      amount = _amount;
    }

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
    internal virtual returns (uint256)
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
    internal virtual
  {
    require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to burn.");

    _burn(msg.sender, _amount);
    tradeinCount = tradeinCount + _amount;			// Future: use safe math here.
    // To-do: provide revenue to vendor

    emit Tradein(msg.sender, _amount);
  }

  function getOwner() public virtual returns (address) {
    return owner();
  }

  function setCreator(address _creator) public virtual onlyOwner {
    creator = _creator ;
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


