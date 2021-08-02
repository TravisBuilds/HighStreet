pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./BancorBondingCurve.sol";
import "./Escrow.sol";

/// @title ProductToken
/// @notice This is version 0 of the product token implementation.
/// @dev This contract lays the foundation for transaction computations, including
///   bonding curve calculations and variable management. Version 0 of this contract
///   does not implement any transaction logic.
contract ProductToken is ERC20Upgradeable, BancorBondingCurve, Escrow, OwnableUpgradeable {
	using SafeMathUpgradeable for uint256;

	event Buy(address indexed sender, uint32 amount, uint deposit);		// event to fire when a new token is minted
  event Sell(address indexed sender, uint32 amount, uint refund);		// event to fire when a token has been sold back
  event Tradein(address indexed sender, uint32 amount);							// event to fire when a token is redeemed in the real world
  event CreatorTransfer(address indexed newCreator);                // event to fire when a creator for the token is set
  event Tradable(bool isTradable);

  bool private isTradable;
  uint256 public reserveBalance;      // amount of liquidity in the pool
  uint32 public reserveRatio;         // computed from the exponential factor in the 
  uint32 public maxTokenCount;        // max token count, determined by the supply of our physical product
  uint32 public tradeinCount;         // number of tokens burned through redeeming procedure. This will drive price up permanently
  uint32 internal supplyOffset;       // an initial value used to set an initial price. This is not included in the total supply.
  address payable public creator;     // address that points to our corporate account address. This is 'public' for testing only and will be switched to internal before release.
  /**
   * @dev modifier used to check whether msg.sender is our corporate account
   *
  */
  modifier onlyCreator {
      require(
          msg.sender == creator,
          "Only creator can call this function."
      );
      _;
  }

  modifier onlyIfTradable {
      require(
          isTradable,
          "Proudct currently unable to trade."
      );
      _;
  }

	/**
   * @dev initializer function.
   *
   * @param _name                     the name of this token
   * @param _symbol                   the symbol of this token
   * @param _reserveRatio             the reserve ratio in the curve function. Number in parts per million
   * @param _maxTokenCount						the amount of token that will exist for this type.
   * @param _supplyOffset             this amount is used to determine initial price.
   * @param _baseReserve              the base amount of reserve tokens, in accordance to _supplyOffset.
   *
  */
  function initialize(string memory _name, string memory _symbol, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) public initializer{
    __Ownable_init();
    __ERC20_init(_name, _symbol);
    __BancorBondingCurve_init();
    __ProductToken_init_unchained(_reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve);
  }

  /**
   * @dev unchained initializer function.
   *
   * @param _reserveRatio             the reserve ratio in the curve function. Number in parts per million
   * @param _maxTokenCount            the amount of token that will exist for this type.
   * @param _supplyOffset             this amount is used to determine initial price.
   * @param _baseReserve              the base amount of reserve tokens, in accordance to _supplyOffset.
   *
  */
  function __ProductToken_init_unchained(uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) internal initializer{
    require(_maxTokenCount > 0, "Invalid max token count.");
    require(_reserveRatio > 0, "Invalid reserve ratio");

    reserveBalance = _baseReserve;
    supplyOffset = _supplyOffset;
    reserveRatio = _reserveRatio;
    maxTokenCount = _maxTokenCount;
  }

  function launch() external virtual onlyCreator {
    require(!isTradable, 'The product token is already launched');
    isTradable = true;
    emit Tradable(isTradable);
  }

  function pause() external virtual onlyCreator {
    require(isTradable, 'The product token is already paused');
    isTradable = false;
    emit Tradable(isTradable);
  }

	/**
   * @dev When user wants to trade in their token for retail product
   * the logistics for transfering product should be handled in the web application through centralized service.
   *
   * @param _amount                   amount of tokens that user wants to trade in.
  */
  function tradein(uint32 _amount) external virtual onlyIfTradable {
  	_tradeinForAmount(_amount);
  }

  fallback () external { } 

  /**
   * @dev Function to check how many tokens of this product are currently available for purchase,
   * by taking the difference between max cap count and current token in circulation or burned.
   *
   * @return available                the number of tokens available
  */
  function getAvailability()
    public view virtual returns (uint32 available)
  {
    return maxTokenCount - uint32(totalSupply()) - tradeinCount;    // add safemath for uint32 later
  }

  /**
   * @dev Function that computes supply value for the bonding curve 
   * based on current token in circulation, token offset initialized, and tokens already redeemed.
   *
   * @return supply                   supply value for bonding curve calculation.                 
  */
  function getTotalSupply()
    internal view virtual returns (uint32 supply)
  {
    return uint32(totalSupply().add(uint256(tradeinCount)).add(uint256(supplyOffset)));
  }

  /**
   * @dev Function that computes current price for a token through bonding curve calculation
   * based on parameters such as total supply, reserve balance, and reserve ratio.
   *
   * @return price                   current price in reserve token (in our case, this is dai).                 
  */
  function getCurrentPrice() 
  	external view virtual returns	(uint256 price)
  {
  	return calculatePriceForNTokens(getTotalSupply(), reserveBalance, reserveRatio, 1);
  }

  /**
   * @dev Function that computes price total for buying n token through bonding curve calculation
   * based on parameters such as total supply, reserve balance, and reserve ratio.
   *
   * @param  _amountProduct          token amount in traded token
   * @return price                   total price in reserve token (in our case, this is dai).                 
  */
  function getPriceForN(uint32 _amountProduct) 
  	public view virtual returns	(uint256 price)
  {
  	return calculatePriceForNTokens(getTotalSupply(), reserveBalance, reserveRatio, _amountProduct);
  }

  /**
   * @dev Function that computes number of product tokens one can buy given an amount in reserve token.
   *
   * @param  _amountReserve          purchaing amount in reserve token (dai)
   * @return mintAmount              number of tokens in traded token that can be purchased by given amount.                  
  */
  function calculateBuyReturn(uint256 _amountReserve)
    public view virtual returns (uint32 mintAmount)
  {
    return calculatePurchaseReturn(getTotalSupply(), reserveBalance, reserveRatio, _amountReserve);
  }

  /**
   * @dev Function that computes selling price in reserve tokens given an amount in traded token.
   *
   * @param  _amountProduct          selling amount in product token
   * @return soldAmount              total amount that will be transferred to the seller.                
  */
  function calculateSellReturn(uint32 _amountProduct)
    public view virtual returns (uint256 soldAmount)
  {
    return calculateSaleReturn(getTotalSupply(), reserveBalance, reserveRatio, _amountProduct);
  }

   /**
   * @dev calculates the return for a given conversion (in product token) 
   * This function validate whether amount of deposit is enough to purchase _amount tokens.
   * If enough, the function will deduct, and then mint specific amount for the user. Any extras are return as change.
   * If not enough, the function will then trying to compute an actual amount that user can buy with _deposit,
   * then replace the _amount with the actual amount and proceed with the above logic.
   *
   * @param _deposit              reserve token deposited
   * @param _amount               the amount of tokens to be bought.
   *
   * @return token                amount bought in product token
   * @return change               amount of change in reserve tokens.
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

    // If the amount in _deposit is more than enough to buy out the rest of the token in the pool
    if (_amount > getAvailability()) {
      _amount = getAvailability();
    }

    actualDeposit = getPriceForN(_amount);    
    if (actualDeposit > _deposit) {   // if user deposited token is not enough to buy ideal amount. This is a fallback option.
      amount = calculateBuyReturn(_deposit);
      actualDeposit = getPriceForN(amount);
    } else {
      amount = _amount;
    }

    _mint(msg.sender, amount);
    reserveBalance = reserveBalance.add(actualDeposit);
    emit Buy(msg.sender, amount, actualDeposit);
    return (amount, _deposit.sub(actualDeposit));    // return amount of token bought and change
  }

   /**
   * @dev calculates the return for a given conversion (in the reserve token) 
   * This function will try to compute the amount of liquidity one gets by selling _amount token, 
   * then it will initiate a transfer.
   *
   * @param _amount              amount of product token wishes to be sold
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
   * This function only handles logics corresponding to token management in the smart contract side.
   *
   * @param _amount              product token wishes to be traded-in
  */
  function _tradeinForAmount(uint32 _amount)
    internal virtual
  {
    require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to burn.");

    uint256 reimburseAmount = calculateSellReturn(_amount);
    _addEscrow(_amount, reimburseAmount);

    _burn(msg.sender, _amount);
    tradeinCount = tradeinCount + _amount;			// Future: use safe math here.

    emit Tradein(msg.sender, _amount);
  }

  function updateServerCheck(address buyer, uint id) onlyCreator external virtual{
    require(buyer != address(0), "Invalid buyer");
    _updateServerCheck(buyer, id);
  }

  function confirmDelivery(address buyer, uint id) onlyCreator external virtual{
    require(buyer != address(0), "Invalid buyer");
    _confirmDelivery(buyer, id);
  }

  function updateUserCompleted(address buyer, uint id) onlyCreator external virtual{
    require(buyer != address(0), "Invalid buyer");
    _updateUserCompleted(buyer, id);
  }

  function updateUserRefund(address buyer, uint id) onlyCreator external virtual{
    require(buyer != address(0), "Invalid buyer");
    uint value = _updateUserRefund(buyer, id);
    require(value >0 , "Invalid value");
    _refund(buyer, value);
  }

  function _refund(address buyer, uint value) internal virtual {
    // todo
  }

  /**
   * @dev Sets the creator of the product to the parameter
   * Can only be set by the owner, which is the Token Factory contract.
   *
   * @param _creator             thea address of the creator.
  */
  function setCreator(address payable _creator) external virtual onlyOwner {
    require(_creator!=address(0), "The newe creator address is not valid");
    creator = _creator ;
    emit CreatorTransfer(_creator);
  }
}


