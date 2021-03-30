pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BancorBondingCurve.sol";

contract LumiToken is ERC20, Ownable {
	using SafeMath for uint256;

	uint256 public scale = 10**18;
  uint256 public reserveBalance = 10*scale;
  uint256 public reserveRatio;

  constructor(uint256 initialReserve) ERC20("LumiToken", "") public {
  		// mint an amount of coins based on the inital reserve. This likely will have to change in the future.
      // _mint(msg.sender,initialReserve*10**18);
  }
}
