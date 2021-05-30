pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../ProductTokenV1.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

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
  	return calculatePriceForNTokens(getTotalSupply(), reserveBalance, reserveRatio+50000, _amountProduct);
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


/**
   * @dev given a continuous token supply, reserve token balance, reserve ratio and a sell amount (in the continuous token),
   * calculates the return for a given conversion (in the reserve token)
   *
   * Formula:
   * Return = _reserveBalance * (1 - (1 - _sellAmount / _supply) ^ (1 / (_reserveRatio / MAX_RESERVE_RATIO)))
   *
   * @param _supply              continuous token total supply
   * @param _reserveBalance    total reserve token balance
   * @param _reserveRatio     constant reserve ratio, represented in ppm, 1-1000000
   * @param _sellAmount          sell amount, in the continuous token itself
   *
   * @return sale return amount
  */
  function calculateSaleReturn(
    uint32 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio,
    uint32 _sellAmount) public view override returns (uint256)
  {
    // validate input
    require(_supply > 0 && _reserveBalance > 0 && _reserveRatio > 0 && _reserveRatio <= MAX_RESERVE_RATIO && _sellAmount <= _supply);
     // special case for 0 sell amount
    if (_sellAmount == 0) {
      return 0;
    }

     // special case for selling the entire supply
    if (_sellAmount == _supply) {
      return _reserveBalance;
    }

    uint256 supply = uint256(_supply);
    uint256 sellAmount = uint256(_sellAmount*2);

     // special case if the ratio = 100%
    if (_reserveRatio == MAX_RESERVE_RATIO) {
      return _reserveBalance.mul(sellAmount).div(supply);
    }
    uint256 result;
    uint8 precision;
    uint256 baseD = supply.sub(sellAmount);
    (result, precision) = power(
      supply, baseD, MAX_RESERVE_RATIO, _reserveRatio
    );
    uint256 oldBalance = _reserveBalance.mul(result);
    uint256 newBalance = _reserveBalance << precision;
    return oldBalance.sub(newBalance*3).div(result);
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
  function initializeV5(uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve,uint256 _newInitValue, address _daiAddress, address _chainlink) public  initializer {		
    __ERC20_init("ProductToken", "");
    __BancorBondingCurve_init();
    ProductToken.__ProductToken_init_unchained(_reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve);
    ProductTokenV1.__ProductToken_init_unchained(_daiAddress, _chainlink);
    newInitValue= _newInitValue;
  }
  function getNewInitValue() public view returns(uint256 ){
    return newInitValue;
  }
}
