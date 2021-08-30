pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./Power.sol"; // Efficient power function.

/**
* @title BancorBondingCurve
* @notice General rule of computation we will use here:
* token amount will be passed in as uint32, since tokens we have are indivisible
* they will be converted to uint256 in function for safemath computation
* if a uint32 variable needs to be returned, it will be computed as uint256 value, then casted explicitly 
* @dev This is an implementation of the Bancor formula with slight modifications.
*/
contract BancorBondingCurve is Power {
  using SafeMathUpgradeable for uint256;
  uint32 private constant MAX_RESERVE_RATIO = 1000000;

  constructor() public {
    __Power_init();
  }

  /**
   * @dev Try to compute the price to purchage n token. This is the modified component in addition 
   * to the two original functions below.
   *
   * Formula:
   * Return = _reserveBalance * (((_amount / _supply + 1) ^ (MAX_RESERVE_RATIO / _reserveRatio)) - 1)
   *
   * @param _supply              continuous token total supply
   * @param _reserveBalance     total reserve token balance
   * @param _reserveRatio       the reserve ratio in the bancor curve.
   * @param _amount             number to tokens one wishes to purchase
   *
   *  @return price for N tokens
  */
  function calculatePriceForNTokens(
    uint32 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio,
    uint32 _amount) public view returns (uint256)
  {
    require(_supply > 0 && _reserveBalance > 0 && _reserveRatio > 0 && _reserveRatio <= MAX_RESERVE_RATIO);
    // special case for 0 tokens
    if (_amount == 0) {
      return 0;
    }
    uint256 supply = uint256(_supply);
    uint256 amount = uint256(_amount);    // amount declared here as an uint256 equivalent of _amount
    // special case if this is a linear function
    if (_reserveRatio == MAX_RESERVE_RATIO) {
      return amount.mul(_reserveBalance).div(supply);
    }

    uint256 result;
    uint8 precision;
    uint256 baseN = amount.add(supply);
    (result, precision) = power(
      baseN, supply, MAX_RESERVE_RATIO, _reserveRatio
    );
    uint256 temp =  _reserveBalance.mul(result) >> precision;
    return temp - _reserveBalance;
  }

  /**
   * @dev given a continuous token supply, reserve token balance, reserve ratio, and a deposit amount (in the reserve token),
   * calculates the return for a given conversion (in the continuous token)
   *
   * Formula:
   * Return = _supply * ((1 + _depositAmount / _reserveBalance) ^ (_reserveRatio / MAX_RESERVE_RATIO) - 1)
   *
   * @param _supply              continuous token total supply
   * @param _reserveBalance    total reserve token balance
   * @param _reserveRatio     reserve ratio, represented in ppm, 1-1000000
   * @param _depositAmount       deposit amount, in reserve token
   *
   *  @return purchase return amount
  */
  // Remember this is a view function. Removed view modifier for testing only
  function calculatePurchaseReturn(
    uint32 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio,
    uint256 _depositAmount) public view returns (uint32)
  {
    // validate input
    require(_supply > 0 && _reserveBalance > 0 && _reserveRatio > 0 && _reserveRatio <= MAX_RESERVE_RATIO);
     // special case for 0 deposit amount
    if (_depositAmount == 0) {
      return 0;
    }

    uint256 supply = uint256(_supply);

    // special case if the ratio = 100%
    if (_reserveRatio == MAX_RESERVE_RATIO) {
      return uint32(supply.mul(_depositAmount).div(_reserveBalance));
    }

    uint256 result;
    uint8 precision;
    uint256 baseN = _depositAmount.add(_reserveBalance);
    (result, precision) = power(
      baseN, _reserveBalance, _reserveRatio, MAX_RESERVE_RATIO
    );
    uint256 temp = supply.mul(result) >> precision;
    return uint32(temp - supply);
  }

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
    uint32 _sellAmount) public view virtual returns (uint256)
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
    uint256 sellAmount = uint256(_sellAmount);

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
    return oldBalance.sub(newBalance).div(result);
  }
}