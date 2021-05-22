pragma solidity ^0.8.2;

import {ClonesUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "./ProductToken.sol";

contract TokenProxyFactory { 

	address public owner;
	address daiAddress;
    address public impContract;
	mapping(string => address) registry;

	constructor(address _daiAddress,address _impContract) public {
		owner = msg.sender;
		daiAddress = _daiAddress;
        impContract=_impContract;
	}

	modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;
  }

	// function initialize() public initializer {

	// }

	function createTokenProxy(string memory _productName, bytes memory _data) public onlyOwner returns (address) {
		require(registry[_productName]==address(0), "The product token already exist");
		address newProxyToken = ClonesUpgradeable.cloneDeterministic(impContract, _data);
		registry[_productName] = newProxyToken;
		return newProxyToken;
	}

	function retrieveToken(string memory _productName) public view returns(address) {
		require(registry[_productName]!=address(0), "This product token does not exist");
		return registry[_productName];
	}
}