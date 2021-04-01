pragma solidity ^0.6.6;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
* @title Dex
*
* 
*/
contract Dex {
  using SafeMath for uint256;
  IERC20 token;

  mapping (address => uint256) public ownership;


  constructor(address token_addr) public {
    token = IERC20(token_addr);
  }
}
