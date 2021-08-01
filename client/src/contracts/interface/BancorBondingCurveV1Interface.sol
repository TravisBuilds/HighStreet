// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface BancorBondingCurveV1Interface {

  function calculatePriceForNTokens(
    uint32 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio,
    uint32 _amount
  )
    external
    view
    returns (
      uint256
    );

  function calculatePurchaseReturn(
    uint32 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio,
    uint256 _depositAmount
  )
    external
    view
    returns (
      uint32
    );

  function calculateSaleReturn(
    uint32 _supply,
    uint256 _reserveBalance,
    uint32 _reserveRatio,
    uint32 _sellAmount
  )
    external
    view
    returns(
      uint256
    );
}