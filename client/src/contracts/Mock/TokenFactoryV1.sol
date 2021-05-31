pragma solidity ^0.8.2;

import "../TokenFactory.sol";

contract TokenFactoryV1 is TokenFactory { 
	function newFunction() public returns(uint256) {
		return 100;
	}
}