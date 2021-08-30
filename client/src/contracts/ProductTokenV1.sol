// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import {AggregatorV3Interface as AggregatorV3Interface_v08 } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./ProductToken.sol";

/// @title ProductTokenV1
/// @notice This is version 1 of the product token implementation.
/// @dev This contract builds on top of version 0 by including transaction logics, such as buy and sell transfers
///    and exchange rate computation by including a price oracle.
contract ProductTokenV1 is ProductToken {
	bool private hasUpdated;
	using SafeMathUpgradeable for uint256;
  IERC20 public dai;
  IERC20 public hsToken;
  AggregatorV3Interface_v08 internal daiEthFeed;
  AggregatorV3Interface_v08 internal hsTokenEthFeed;
  uint256 public supplierDai;
  address public supplierWallet;
  bool private isSupportHsToken;

  event Update(address daiAddress, address chainlinkAddress);
  event UpdateHsToken(address daiAddress, address chainlinkAddress);

	/**
   * @dev initializer function.
   *
   * @param _name											the name of this token
   * @param _symbol										the symbol of this token
   * @param _reserveRatio             the reserve ratio in the curve function.
   * @param _maxTokenCount						the amount of token that will exist for this type.
   * @param _supplyOffset             this amount is used to determine initial price.
   * @param _baseReserve              the base amount of reserve tokens, in accordance to _supplyOffset.
   * @param _daiAddress								the on-chain address of Dai, one of our supported reserve token
   * @param _chainlink								the address needed to create a aggregator for Chainlink.
  */
  function initialize(string memory _name, string memory _symbol, address _bondingCurveAddress, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve, address _daiAddress, address _chainlink) public initializer{
		ProductToken.initialize(_name, _symbol, _bondingCurveAddress, _reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve);
		__ProductToken_init_unchained(_daiAddress, _chainlink);
  }

  /**
   * @dev update function. This function is to be called when updaing a product token from version 0 to version 1.
   * This is not to be called again after initialization or update function has been called once.
   *
   * @param _daiAddress               the on-chain address of Dai, one of our supported reserve token
   * @param _chainlink                the address needed to create a aggregator for Chainlink.
  */
  function update(address _daiAddress, address _chainlink) external onlyOwner {
  	require(!hasUpdated, "contract is already updated");
  	// Duplicate logic here.
    require(_daiAddress!=address(0), "Invalid dai contract address");
    require(_chainlink!=address(0), "Invalid chainlink contract address");
    dai = IERC20(_daiAddress);
    daiEthFeed = AggregatorV3Interface_v08(_chainlink);

  	hasUpdated = true;
    emit Update(_daiAddress, _chainlink);
  }

  /**
   * @dev unchained initializer function.
   *
   * @param _daiAddress               the on-chain address of Dai, one of our supported reserve token
   * @param _chainlink                the address needed to create a aggregator for Chainlink.
  */
  function __ProductToken_init_unchained(address _daiAddress, address _chainlink) internal initializer {
    require(_daiAddress!=address(0), "Invalid dai contract address");
    require(_chainlink!=address(0), "Invalid chainlink contract address");

    dai = IERC20(_daiAddress);
    daiEthFeed = AggregatorV3Interface_v08(_chainlink);
    hasUpdated = true;
    emit Update(_daiAddress, _chainlink);
  }

  /**
   * @dev This is a placeholder function for a price oracle.
   * Our current price oracle of choice is Chainlink. 
   * The goal is that once High Street Token becomes officially supported by chainlink, 
   * we can update the contract to support conversion between Street Token and Dai.
   *
   * @param _hsTokenAddress           the address of deployed Street Token
   * @param _chainlink                the address of chainlink interface
  */
  function setupHsToken(address _hsTokenAddress, address _chainlink) onlyOwner external virtual {
    require(!isSupportHsToken, "already updated");
    require(_hsTokenAddress!=address(0), "Invalid contract address");
    require(_chainlink!=address(0), "Invalid chainlink address");

    hsToken = IERC20(_hsTokenAddress);
    hsTokenEthFeed = AggregatorV3Interface_v08(_chainlink);
    isSupportHsToken = true;
    emit UpdateHsToken(_hsTokenAddress, _chainlink);
  }

  /**
   * @dev Function that initiate a purchase transaction for the user.
   * this function is designed if user wants to pay with ether.
   * since we compute bonding curve with dai, we have to first convert ether price into dai.
   * transactions are still handled using eth.
   *
  */
  function buy() external virtual payable onlyIfTradable {
    require(msg.value > 0, "Must send ether to buy tokens.");

    int256 daieth = getLatestDaiEthPrice();
    uint256 incomingDai = msg.value.mul(10**18).div(uint256(daieth));
    uint256 amount;
    uint256 change;
    (amount, change) = _buy(incomingDai);

    // return change back to the sender.
    if (amount > 0) {                                               // If token transaction went through successfully
      if(change > 0) {
        payable(msg.sender).transfer(change.mul(uint256(daieth)).div(10**18));
      }
      _updateSupplierFee(incomingDai);
    }
    else {                                                          // If token transaction failed
      payable(msg.sender).transfer(msg.value);
    }
  }

  /**
   * @dev Function that initiate a purchase transaction for the user.
   * this function is designed if user wants to pay with dai.
   *
   * @param _daiAmount              amount of dai being paid to the contract
  */
  function buyWithDai(uint256 _daiAmount) external virtual onlyIfTradable {

    require(_daiAmount > 0, "Must be greater than 0 to buy tokens.");
    bool success = dai.transferFrom(msg.sender, address(this), _daiAmount);
    require(success, "Purchase failed.");
    uint256 amount;
    uint256 change;
    (amount, change) = _buy(_daiAmount);
    // return change back to the sender.
    if (amount > 0) {                                               // If token transaction went through successfully
      if(change > 0) {
        dai.transfer(msg.sender, change);
      }
      _updateSupplierFee(_daiAmount);
    }
    else {                                                          // If token transaction failed
      dai.transfer(msg.sender, _daiAmount);
    }
  }

  /**
   * @dev Function that initiate a purchase transaction for the user.
   * this function is a placeholder function, to simulate a scenario where user wants to pay with Street Token.
   *
   * @param _hsTokenAmount            amount of Street Token being paid to the contract
  */
  function buyWithHsToken(uint256 _hsTokenAmount) external virtual onlyIfTradable {
    require(isSupportHsToken, "not support yet");
    require(_hsTokenAmount > 0, "Must be greater than 0 to buy tokens.");
    bool success = hsToken.transferFrom(msg.sender, address(this), _hsTokenAmount);
    require(success, "Purchase failed");

    int256 hsEth = getLatestHsTokenEthPrice();
    int256 daieth = getLatestDaiEthPrice();

    uint256 incomingDai = _hsTokenAmount.mul(uint256(hsEth)).div(uint256(daieth));

    (
      uint256 amount,
      uint256 change
    ) = _buy(incomingDai);

    // return change back to the sender.
    if (amount > 0) {
      uint256 hsTokenChange = change.div(uint256(hsEth)).mul(uint256(daieth));
      if(change > 0) {
        hsToken.transfer(msg.sender, hsTokenChange);
      }
      _updateSupplierFee(incomingDai);
    } else {
      hsToken.transfer(msg.sender, _hsTokenAmount);
    }
  }

  /**
   * @dev When user wants to sell their tokens back to the pool.
   * currently sales return are handled using Dai. In the future, we'll issue platform token instead.
   *
   * @param _amount             the amount of tokens to be sold.
  */
 	function sell(uint32 _amount) external virtual onlyIfTradable {
    uint256 returnAmount = _sellForAmount(_amount);
    bool success = dai.transfer(msg.sender, returnAmount.mul(980000).div(1000000));        // ppm of 98%. 2% is the platform transaction fee
    _updateSupplierFee(returnAmount);
    require(success, "selling token failed");
  }

  /**
     * @dev this is the interfacing function to use chainlink service.
     * Network: Mainnet
     * Aggregator: DAI/ETH
     * Address: 0x773616E4d11A78F511299002da57A0a94577F1f4
  */
  function getLatestDaiEthPrice() public view virtual returns (int) {
    (
      uint80 roundID,
      int price,
      uint startedAt,
      uint timeStamp,
      uint80 answeredInRound
    ) = daiEthFeed.latestRoundData();
    require(price > 0, "Invalid DaiEth Exchange rate");
    return price;
  }

  /**
   * @dev Function that computes current price for a token through bonding curve calculation
   * based on parameters such as total supply, reserve balance, and reserve ratio.
   *
   * @return price                   current price in reserve token (ether).
  */
  function getCurrentPriceOnEther() public view virtual returns (uint256) {
    int256 daieth = getLatestDaiEthPrice();
    return getCurrentPrice().mul(uint256(daieth)).div(10**18);
  }

  /**
     * @dev this is a mock interfacing function to use chainlink service.
     * Network: Mainnet
     * Aggregator: HSToken/ETH
     * Address: TBD
  */
  function getLatestHsTokenEthPrice() public view virtual returns (int) {
    require(isSupportHsToken, "Not support yet");
    (
      uint80 roundID,
      int price,
      uint startedAt,
      uint timeStamp,
      uint80 answeredInRound
    ) = hsTokenEthFeed.latestRoundData();
    require(price > 0, "Invalid HsTokenEth Exchange rate");
    return price;
  }

  /**
   * @dev Function that computes current price for a token through bonding curve calculation
   * based on parameters such as total supply, reserve balance, and reserve ratio.
   *
   * @return price                   current price in reserve token (HsToken).
  */
  function getCurrentPriceOnHsToken() public view virtual returns (uint256) {
    int256 hsEth = getLatestHsTokenEthPrice();
    int256 daieth = getLatestDaiEthPrice();
    return getCurrentPrice().mul(uint256(daieth)).div(uint256(hsEth));
  }

  /**
     * @dev this is a function that links wallet address of a supplier to a product.
     *
     * @param _supplierWallet         The wallet address provided by a brand supplier
  */
  function setSupplierWallet(address _supplierWallet) external virtual onlyOwner {
    require(_supplierWallet!=address(0), "Address is invalid");
    supplierWallet = _supplierWallet ;
  }

  /**
     * @dev this is a function updates the amount of liquidity a supplier can withdraw from our liquidity pool
     * The amount is 1 percent of the product value when a buy/sale has happened. 
     *
     * @param value         The value of the product
  */
  function _updateSupplierFee(uint256 value) internal override returns(uint256) {
    require(value > 0, "no enough value");
    uint256 charge = value.mul(10000).div(1000000);
    supplierDai = supplierDai.add(charge);
    return charge;
  }

  /**
     * @dev this function returns the amount of reserve balance (dai) that the supplier can withdraw from the dapp.
     * 
  */
  function getSupplierDaiBalance() public view virtual returns (uint256) {
    return supplierDai;
  }

  /**
     * @dev A method for supplier to claim reserve currency that's accumulated over time.
     * 
     * @param _amount       The amount of reserve currency that supplier wants to withdraw
  */
  function claimSupplierDai(uint256 _amount) external virtual {
    require(msg.sender==supplierWallet, "The address is not allowed");
    if (_amount <= supplierDai){
      bool success =  dai.transfer(msg.sender, _amount);
      if (success) {
        supplierDai = supplierDai.sub(_amount);
      }
    }
  }

  /**
     * @dev A method that refunds the value of a product to a buyer/customer.
     *
     * @param _buyer       The wallet address of the owner whose product token is under the redemption process
     * @param _value       The market value of the token being redeemed
     *
  */
  function _refund(address _buyer, uint256 _value) internal override {
    bool success = dai.transfer(_buyer, _value);
    require(success, "refund token failed");
  }

  /**
     * @dev A method allow us to add liquidity (dai) to the contract
     * Since we use dai as a return for sales, we predict we'll have to keep dai 
     *
     * @param _amount       The amount of tokens in reserve currency (dai)
     *
  */
  function depositDai(uint256 _amount) external virtual {
    bool success = dai.transferFrom(msg.sender, address(this), _amount);
    require(success, "adding liquidity failed");
  }

  /**
     * @dev A method allow us to withdraw liquidity (eth) from the contract
     * Since eth is not used as a return currency, we need to withdraw eth from the system.
     *
     * @param _value       the value of ether
     *
  */
  function withdrawEther(uint256 _value) payable external virtual onlyOwner {
    require(address(this).balance > 0, "no enough ether");
    payable(msg.sender).transfer(_value);
  }

}