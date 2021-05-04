pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DaiMock is ERC20{
	constructor() public ERC20('Dai Stablecoin', 'DAI') {

	}

	// This is a test function used to initialize some amount of the mock dai token for a test account.
	function faucet(address _recipient, uint256 _amount) external {
		_mint(_recipient, _amount);
	}
}