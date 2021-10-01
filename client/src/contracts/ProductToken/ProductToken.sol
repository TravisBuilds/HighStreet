// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "./interface/BancorBondingCurveV1Interface.sol";
import "./Escrow.sol";

/// @title ProductToken
/// @notice This is version 0 of the product token implementation.
/// @dev This contract lays the foundation for transaction computations, including
///   bonding curve calculations and variable management. Version 0 of this contract
///   does not implement any transaction logic.
contract ProductToken is ERC20Upgradeable, Escrow, OwnableUpgradeable {
	using SafeMathUpgradeable for uint256;

	event Buy(address indexed sender, uint32 amount, uint256 price);		// event to fire when a new token is minted
  event Sell(address indexed sender, uint32 amount, uint256 price);		// event to fire when a token has been sold back
  event Tradein(address indexed sender, uint32 amount);							// event to fire when a token is redeemed in the real world
  event Tradable(bool isTradable);

  bool private isTradable;
  uint256 public reserveBalance;      // amount of liquidity in the pool
  uint256 public tradeinReserveBalance;      // amount of liquidity in the pool
  uint32 public reserveRatio;         // computed from the exponential factor in the
  uint32 public maxTokenCount;        // max token count, determined by the supply of our physical product
  uint32 public tradeinCount;         // number of tokens burned through redeeming procedure. This will drive price up permanently
  uint32 internal supplyOffset;       // an initial value used to set an initial price. This is not included in the total supply.
  address private _manager;

  BancorBondingCurveV1Interface internal bondingCurve;

  modifier onlyIfTradable {
      require(
          isTradable,
          "unable to trade now"
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
  function initialize(string memory _name, string memory _symbol, address _bondingCurveAddress,
      uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) public virtual initializer{
    __Ownable_init();
    __ERC20_init(_name, _symbol);
    __ProductToken_init_unchained(_bondingCurveAddress, _reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve);
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
  function __ProductToken_init_unchained(address _bondingCurveAddress, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) internal initializer{
    require(_maxTokenCount > 0, "Invalid max token count.");
    require(_reserveRatio > 0, "Invalid reserve ratio");
    bondingCurve = BancorBondingCurveV1Interface(_bondingCurveAddress);
    reserveBalance = _baseReserve;
    tradeinReserveBalance = _baseReserve;
    supplyOffset = _supplyOffset;
    reserveRatio = _reserveRatio;
    maxTokenCount = _maxTokenCount;
  }

  function decimals() public view virtual override returns (uint8) {
      return 0;
  }

  /**
   * @dev requires function to be called from owner. sets a bonding curve implementation for this product.
   *
   * @param _address             the address of the bonding curve implementation
   *
  */
  function setBondingCurve(address _address) external virtual onlyOwner {
    require(_address!=address(0), "Invalid address");
    bondingCurve = BancorBondingCurveV1Interface(_address);
  }

  /**
   * @dev requires function to be called from owner. this enables customers to buy, sell, or redeem the product.
   *
  */
  function launch() external virtual onlyOwner {
    require(!isTradable, 'The product token is already launched');
    isTradable = true;
    emit Tradable(isTradable);
  }

  /**
   * @dev requires function to be called from owner. this prevents customers from buying, selling, or redeeming the product.
   *
  */
  function pause() external virtual onlyOwner {
    require(isTradable, 'The product token is already paused');
    isTradable = false;
    emit Tradable(isTradable);
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
  function _getTotalSupply()
    internal view virtual returns (uint32 supply)
  {
    return uint32(totalSupply().add(uint256(tradeinCount)).add(uint256(supplyOffset)));
  }

  /**
   * @dev Function that computes current price for a token through bonding curve calculation
   * based on parameters such as total supply, reserve balance, and reserve ratio.
   *
   * @return price                   current price in reserve token (in our case, this is dai). (with 4% platform fee)
  */
  function getCurrentPrice()
  	public view virtual returns	(uint256 price)
  {
    return getPriceForN(1);
  }

  /**
   * @dev Function that computes price total for buying n token through bonding curve calculation
   * based on parameters such as total supply, reserve balance, and reserve ratio.
   *
   * @param  _amountProduct          token amount in traded token
   * @return price                   total price in reserve token (in our case, this is dai). (with 4% platform fee)
  */
  function getPriceForN(uint32 _amountProduct)
  	public view virtual returns	(uint256 price)
  {
    (uint value, uint fee) = _getPriceForN(_amountProduct);
    return value.add(fee);
  }

  function _getPriceForN(uint32 _amountProduct)
  	internal view virtual returns	(uint256, uint256) {
      uint256 price = bondingCurve.calculatePriceForNTokens(_getTotalSupply(), reserveBalance, reserveRatio, _amountProduct);
      //4% is the platform transaction fee
      uint256 fee = price.mul(4e12).div(1e14);
      return (price, fee);
    }

  function _buyReturn(uint256 _amountReserve)
    internal view virtual returns (uint32, uint)
  {
    uint value = _amountReserve.mul(1e12).div(1.04e12);
    //4% is the platform transaction fee
    uint fee = value.mul(4e12).div(1e14);
    uint32 amount = bondingCurve.calculatePurchaseReturn(_getTotalSupply(), reserveBalance, reserveRatio, value.sub(fee));
    return (amount, fee);
  }

  /**
   * @dev Function that computes number of product tokens one can buy given an amount in reserve token.
   *
   * @param  _amountReserve          purchaing amount in reserve token (dai)(with 4% platform fee)
   * @return mintAmount              number of tokens in traded token that can be purchased by given amount.
  */
  function calculateBuyReturn(uint256 _amountReserve)
    public view virtual returns (uint32 mintAmount)
  {
    (uint32 amount,) = _buyReturn(_amountReserve);
    return amount;
  }

  function _sellReturn(uint32 _amountProduct)
    internal view virtual returns (uint256, uint256)
  {
    // ppm of 98%. 2% is the platform transaction fee
    uint reimburseAmount = bondingCurve.calculateSaleReturn(_getTotalSupply(), reserveBalance, reserveRatio, _amountProduct);
    uint fee = reimburseAmount.mul(2e10).div(1e12);
    return (reimburseAmount, fee);
  }

  /**
   * @dev Function that computes selling price in reserve tokens given an amount in traded token.
   *
   * @param  _amountProduct          selling amount in product token
   * @return soldAmount              total amount that will be transferred to the seller (with 2% platform fee).
  */
  function calculateSellReturn(uint32 _amountProduct)
    public view virtual returns (uint256 soldAmount)
  {
    (uint reimburseAmount, uint fee) = _sellReturn(_amountProduct);
    return reimburseAmount.sub(fee);
  }

   /**
   * @dev calculates the return for a given conversion (in product token)
   * This function validate whether is enough to purchase token.
   * If enough, the function will deduct, and then mint one token for the user. Any extras are return as change.
   * If not enough, will return as change directly
   * then replace the _amount with the actual amount and proceed with the above logic.
   *
   * @param _deposit              reserve token deposited
   *
   * @return token                amount bought in product token
   * @return change               amount of change in reserve tokens.
   * @return price
   * @return fee
  */
  function _buy(uint256 _deposit)
    internal virtual returns (uint32, uint256, uint256, uint256)
  {
  	require(getAvailability() > 0, "Sorry, this token is sold out.");
    require(_deposit > 0, "Deposit must be non-zero.");

    (uint price, uint fee ) = _getPriceForN(1);

    if (price > _deposit) {
      return (0, _deposit, 0, 0);
    }
    _mint(msg.sender, 1);
    reserveBalance = reserveBalance.add(price);
    emit Buy(msg.sender, 1, price.add(fee));
    return (1, _deposit.sub(price).sub(fee), price, fee);
  }

   /**
   * @dev calculates the return for a given conversion (in the reserve token)
   * This function will try to compute the amount of liquidity one gets by selling _amount token,
   * then it will initiate a transfer.
   *
   * @param _amount              amount of product token wishes to be sold
   *
   * @return amount               amount sold in reserved token
   * @return fee
  */
  function _sellForAmount(uint32 _amount)
    internal virtual returns (uint256, uint256)
  {
  	require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to sell.");
    // calculate amount of liquidity to reimburse
  	(uint256 reimburseAmount, uint256 fee) = _sellReturn(_amount);
 		reserveBalance = reserveBalance.sub(reimburseAmount);
    _burn(msg.sender, _amount);

    emit Sell(msg.sender, _amount, reimburseAmount);
    return (reimburseAmount.sub(fee), fee);
  }

  function calculateTradinReturn(uint32 _amount)
    public view virtual returns (uint256)
  {
  	require(_amount > 0, "invalid amount");
    uint32 supply = uint32(uint256(_amount).add(uint256(tradeinCount)).add(uint256(supplyOffset)));
  	return bondingCurve.calculateSaleReturn(supply, tradeinReserveBalance, reserveRatio, _amount);
  }


  /**
   * @dev used to update the status of redemption to "User Complete" after an escrow process has been started.
   *
   * @param buyer                 the wallet address of product buyer
   * @param id                    the id of the escrow, returned to the user after starting of redemption process
  */
  function updateUserCompleted(address buyer, uint256 id) external virtual {
    require(msg.sender == owner() || msg.sender == _manager, 'permission denied');
    require(buyer != address(0), "Invalid buyer");
    _updateUserCompleted(buyer, id);
  }

  /**
   * @dev used to update the status of redemption to "User Refunded" after an escrow process has been started.
   *
   * @param buyer                 the wallet address of product buyer
   * @param id                    the id of the escrow, returned to the user after starting of redemption process
  */
  function updateUserRefund(address buyer, uint256 id) external virtual{
    require(msg.sender == owner() || msg.sender == _manager, 'permission denied');
    require(buyer != address(0), "Invalid buyer");
    uint256 value = _updateUserRefund(buyer, id);
    require(value >0 , "Invalid value");
    _refund(buyer, value);
  }

  /**
   * @dev refund function.
   * This function returns the equivalent amount of Dai (reserve currency) to a product owner if an redemption fails
   * This is only triggered in the extremely rare cases.
   * This function is not implemented in Version 0 of Product Token
   *
   * @param _buyer       The wallet address of the owner whose product token is under the redemption process
   * @param _value       The market value of the token being redeemed
  */
  function _refund(address _buyer, uint256 _value) internal virtual {
    // override
  }

  function setManager(address addr_) external virtual onlyOwner {
    require(addr_ != address(0), 'invalid address');
    _manager = addr_;
  }

  function getManager() external view virtual returns(address) {
    return _manager;
  }

}

