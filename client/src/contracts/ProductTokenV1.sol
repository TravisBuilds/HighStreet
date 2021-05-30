pragma solidity ^0.8.2;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./ProductToken.sol";

contract ProductTokenV1 is ProductToken {
	using SafeMathUpgradeable for uint256;
  IERC20 internal dai;
  AggregatorV3Interface internal daiEthFeed;

	/**
   * @dev Constructor
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
  function initialize(string memory _name, string memory _symbol, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve, address _daiAddress, address _chainlink) public initializer {   
 			ProductToken.initialize(_name, _symbol, _reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve);
 			__ProductToken_init_unchained(_daiAddress, _chainlink);
  }

  function __ProductToken_init_unchained(address _daiAddress, address _chainlink) internal initializer { //, address _daiAddress, address _chainlink) public initializer {
    require(_daiAddress!=address(0), "Invalid dai contract address");
    require(_chainlink!=address(0), "Invalid chainlink contract address");

    dai = IERC20(_daiAddress);
    daiEthFeed = AggregatorV3Interface(_chainlink);
  }

  /**
   * @dev When user wants to buy tokens from the pool
   *
   * @param _amount             the amount of tokens to be bought.
  */
  function buy(uint32 _amount) public virtual payable {
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

  // support different payment functions 
  function buyWithDai(uint256 _daiAmount, uint32 _amount) public virtual {
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
   * @dev When user wants to sell their tokens back to the pool
   *
   * @param _amount             the amount of tokens to be sold.
  */
 	function sell(uint32 _amount) public virtual {
    uint256 returnAmount = _sellForAmount(_amount);
    bool success = dai.transfer(msg.sender, returnAmount.mul(980000).div(1000000));        // ppm of 98%. 2% is the platform transaction fee
    require(success, "selling token failed");
  }

  /**
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
}