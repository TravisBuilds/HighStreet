pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "../ProductToken.sol";
import "../ProductTokenV1.sol";
import "../Power.sol";


contract ProductTokenV2 is ProductTokenV1 {
  uint256 public newAttribute;

  function getNewAttribute()
  public view returns (uint256)
  {
    return newAttribute + 1;
  }

  function getPriceForN(uint32 _amountProduct) 
  	public view override returns(uint256 price)
  {
  	return bondingCurve.calculatePriceForNTokens(getTotalSupply(), reserveBalance, reserveRatio+50000, _amountProduct);
  }

    function getAvailability()
     public view override returns (uint32 available)
  {
    return maxTokenCount - uint32(totalSupply()) - tradeinCount+100;   
  }

} 

contract ProductTokenV3 is ProductTokenV2 {
    using SafeMathUpgradeable for uint256;
    uint32 private constant MAX_RESERVE_RATIO = 2000000;

    function initializeV3(string memory _name, string memory _symbol, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve, uint256 _newInitValue, address _daiAddress, address _chainlink) public  initializer {
    }
}

contract ProductTokenDestroy {

}

contract ProductTokenV4 is ProductTokenV2 {

}

contract ProductTokenV5 is ProductTokenV3 {
  uint256  public newInitValue;
/**
   * @dev Constructor
   *
   * @param _reserveRatio             the reserve ratio in the curve function
   * @param _maxTokenCount						the amount of token that will exist for this type.
   * @param _supplyOffset             a initial amount of offset that drive the price to a starting price
   * @param _baseReserve              the reserve balance when supply is 0. This is calculated based on the balance function, and evaluated at s = _supplyOffset
  */
  function initializeV5(string memory _name, string memory _symbol, address _bondingCurveAddress, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve, uint256 _newInitValue, address _daiAddress, address _chainlink) public  initializer {		
    __ERC20_init(_name, _symbol);
    ProductToken.__ProductToken_init_unchained(_bondingCurveAddress, _reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve);
    ProductTokenV1.__ProductToken_init_unchained(_daiAddress, _chainlink);
    newInitValue= _newInitValue;
  }
  function getNewInitValue() public view returns(uint256){
    return newInitValue;
  }
}
