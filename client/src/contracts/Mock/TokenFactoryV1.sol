pragma solidity ^0.8.2;

import "../TokenFactory.sol";

contract TokenFactoryV1 is TokenFactory { 
	uint256 public newAttribute;

  function getNewAttribute()
  public view returns (uint256)
  {
    return newAttribute + 1;
  }

}