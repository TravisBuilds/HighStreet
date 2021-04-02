pragma solidity ^0.6.6;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Power.sol"; // Efficient power function.

/**
* @title Bancor formula by Bancor
*
* Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements;
* and to You under the Apache License, Version 2.0. "
*/
contract BancorBondingCurve is Power {
  using SafeMath for uint256;
  uint32 private constant MAX_RESERVE_RATIO = 1000000;

 /** @depreciated
   * @dev Try to compute the current price for a given token
   *
   * Formula:
   * Return = balance / (supply * reserve ratio)
   *
   * @param _supply              continuous token total supply
   * @param _reserveBalance    total reserve token balance
   * @param _reserveRatio     reserve ratio, represented in ppm, 1-1000000
   *
   *  @return unit price per token (as of function call)
  */
  // Remember this is a view function. Removed view modifier for testing only
  function calculateUnitPrice(
    uint256 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio
  ) public view returns (uint256) 
  {
     // validate input
    require(_supply > 0 && _reserveBalance > 0 && _reserveRatio > 0 && _reserveRatio <= MAX_RESERVE_RATIO);
    uint256 numerator =  _reserveBalance.mul(MAX_RESERVE_RATIO);
    uint256 denumerator = _supply.mul(uint256(_reserveRatio));   // this returns the price based on reserve unit.
    // return numerator.div(denumerator);
    return 1;
  }

  /**
   * @dev Try to compute the price to purchage n token
   *
   * Formula:
   * Return = _reserveBalance * ((_amount / _supply + 1) ^ (_exponent + 1) -1)
   *
   * @param _supply              continuous token total supply
   * @param _reserveBalance    total reserve token balance
   * @param _exponent         The exponent component in the bancor curve.
   * @param _amount           number to tokens one wishes to purchase
   *
   *  @return price for N tokens 
  */
  function calculatePriceForNTokens(
    uint256 _supply,
    uint256 _reserveBalance,
    uint32 _exponent,
    uint32 _amount) public view returns (uint256)
  {
    require(_supply > 0 && _reserveBalance > 0 && _exponent > 0);
    // special case for 0 tokens
    if (_amount == 0) {
      return 0;
    } 
    // special case if this is a linear function
    if (_exponent == 1) {
      return uint256(_amount).mul(_reserveBalance).div(_supply);
    }
    uint256 result;
    uint8 precision;
    (result, precision) = power(
      _amount + _supply, _supply, _exponent + 1, 1
    );    // need safe math for uint32 here.
    return _reserveBalance.mul(result >> precision);
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
    uint256 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio,
    uint256 _depositAmount) public view returns (uint256)
  {
    // validate input
    require(_supply > 0 && _reserveBalance > 0 && _reserveRatio > 0 && _reserveRatio <= MAX_RESERVE_RATIO);
     // special case for 0 deposit amount
    if (_depositAmount == 0) {
      return 0;
    }
     // special case if the ratio = 100%
    if (_reserveRatio == MAX_RESERVE_RATIO) {
      return _supply.mul(_depositAmount).div(_reserveBalance);
    }
    uint256 result;
    uint8 precision;
    uint256 baseN = _depositAmount.add(_reserveBalance);
    (result, precision) = power(
      baseN, _reserveBalance, _reserveRatio, MAX_RESERVE_RATIO
    );
    uint256 tokens = _supply.mul(result >> precision);    // maybe have to do a plus one here?
    return tokens;
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
    uint256 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio,
    uint256 _sellAmount) public view returns (uint256)
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
     // special case if the ratio = 100%
    if (_reserveRatio == MAX_RESERVE_RATIO) {
      return _reserveBalance.mul(_sellAmount).div(_supply);
    }
    uint256 result;
    uint8 precision;
    uint256 baseN = _supply - _sellAmount;
    (result, precision) = power(
      baseN, _supply, MAX_RESERVE_RATIO, _reserveRatio
    );
    return _reserveBalance.sub((result >> precision).mul(_reserveBalance))
    // uint256 baseD = _supply - _sellAmount;
    // (result, precision) = power(
    //   _supply, baseD, MAX_RESERVE_RATIO, _reserveRatio
    // );
    // uint256 oldBalance = _reserveBalance.mul(result);
    // uint256 newBalance = _reserveBalance << precision;
    // return oldBalance.sub(newBalance).div(result);
  }
}