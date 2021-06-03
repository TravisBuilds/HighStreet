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
  AggregatorV3Interface_v08 internal daiEthFeed;

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
  function initialize(string memory _name, string memory _symbol, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve, address _daiAddress, address _chainlink) public initializer{   
		ProductToken.initialize(_name, _symbol, _reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve);
		__ProductToken_init_unchained(_daiAddress, _chainlink);
  }

  /**
   * @dev update function. This function is to be called when updaing a product token from version 0 to version 1.
   * This is not to be called again after initialization or update function has been called once.
   *
   * @param _daiAddress               the on-chain address of Dai, one of our supported reserve token
   * @param _chainlink                the address needed to create a aggregator for Chainlink.
  */
  function update(address _daiAddress, address _chainlink) public onlyCreator{
  	require(!hasUpdated, "contract is already updated");
  	// Duplicate logic here.
    require(_daiAddress!=address(0), "Invalid dai contract address");
    require(_chainlink!=address(0), "Invalid chainlink contract address");
    dai = IERC20(_daiAddress);
    daiEthFeed = AggregatorV3Interface_v08(_chainlink);

  	hasUpdated = true;
  }

  /**
   * @dev unchained initializer function.
   *
   * @param _daiAddress               the on-chain address of Dai, one of our supported reserve token
   * @param _chainlink                the address needed to create a aggregator for Chainlink.
  */
  function __ProductToken_init_unchained(address _daiAddress, address _chainlink) internal initializer{
    require(_daiAddress!=address(0), "Invalid dai contract address");
    require(_chainlink!=address(0), "Invalid chainlink contract address");

    dai = IERC20(_daiAddress);
    daiEthFeed = AggregatorV3Interface_v08(_chainlink);
    hasUpdated = true;
  }

  /**
   * @dev Function that initiate a purchase transaction for the user.
   * this function is designed if user wants to pay with ether.
   * since we compute bonding curve with dai, we have to first convert ether price into dai.
   * transactions are still handled using eth.
   *
   * @param _amount             the amount of tokens to be bought.
  */
  function buy(uint32 _amount) external virtual payable {
    require(msg.value > 0, "Must send ether to buy tokens.");

    int daieth = getLatestDaiEthPrice();
    require(daieth > 0, "Exchange rate is equal or less than 0");
    uint256 incomingEth = msg.value.mul(10**18).div(uint256(daieth));
    uint256 amount;
    uint256 change;    
    (amount, change) = _buyForAmount(incomingEth.mul(960000).div(1000000), _amount); // ppm of 96%. 4% is the platform transaction fee
    // return change back to the sender.
    if (amount > 0) {                                               // If token transaction went through successfully
      payable(msg.sender).transfer(change.mul(uint256(daieth)).div(10**18));
    }
    else {                                                          // If token transaction failed
      payable(msg.sender).transfer(msg.value);                                 
    }
  }

  /**
   * @dev Function that initiate a purchase transaction for the user.
   * this function is designed if user wants to pay with dai.
   *
   * @param _amount             the amount of tokens to be bought.
  */
  function buyWithDai(uint256 _daiAmount, uint32 _amount) external virtual {
    require(_daiAmount > 0, "Value of dai must be greater than 0 to buy tokens.");
    bool success = dai.transferFrom(msg.sender, address(this), _daiAmount);
    require(success, "Purchase failed, amount to buy token was not successfully transferred.");
    uint256 amount;
    uint256 change;
    (amount, change) = _buyForAmount(_daiAmount.mul(960000).div(1000000), _amount); // ppm of 96%. 4% is the platform transaction fee
    // return change back to the sender.
    if (amount > 0) {                                               // If token transaction went through successfully
      dai.transfer(msg.sender, change);
    }
    else {                                                          // If token transaction failed
      dai.transfer(msg.sender, _daiAmount);                               
    }
  }

  /**
   * @dev When user wants to sell their tokens back to the pool.
   * currently sales return are handled using Dai. In the future, we'll issue platform token instead.
   *
   * @param _amount             the amount of tokens to be sold.
  */
 	function sell(uint32 _amount) external virtual {
    uint256 returnAmount = _sellForAmount(_amount);
    bool success = dai.transfer(msg.sender, returnAmount.mul(980000).div(1000000));        // ppm of 98%. 2% is the platform transaction fee
    require(success, "selling token failed");
  }

  /**
     * @dev tihs is the interfacing function to use chainlink service.
     * Network: Kovan
     * Aggregator: ETH/DAI
     * Address: 0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541
  */
  function getLatestDaiEthPrice() public view virtual returns (int) {
    (
        uint80 roundID, 
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
    ) = daiEthFeed.latestRoundData();
    return price;
  }

  
  /**
   * @dev Return address of the current owner. This is used in testing only.
   *
   * @return address              address of the owner.
  */
  function getOwner() public override returns (address) {
    return owner();
  }

}