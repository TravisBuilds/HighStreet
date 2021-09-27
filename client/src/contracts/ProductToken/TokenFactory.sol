// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title TokenFactory
/// @dev This is the factory smart contract that is responsible for token creation and address management.
contract TokenFactory is Initializable, UUPSUpgradeable, OwnableUpgradeable {

	IBeacon public beacon;										// this is set to Public for the purpose of testing. In release this will be internal 
	mapping(string => address) registry;			// registry for storing products. Mapped from product name to address.

	event Create(string name, bool state);		// event to fire when a new type of token is created
	event UpdatedBeacon(address newBeacon);		// event to fire when a new beacon replaces old beacon

	/**
   * @dev initializer function.
   *
   * @param _beacon                   	address for beacon pointing to the implementation logic for product tokens
   *
  */
	function initialize(address _beacon) external initializer{
		__Ownable_init();
		UpdateBeacon(_beacon);
	}

	/**
   * @dev update function for the beacon address.
   *
   * @param _beacon                    address for beacon
   *
  */
	function UpdateBeacon(address _beacon) public onlyOwner {
		require( Address.isContract(_beacon), "Invalid Beacon address");
		beacon = IBeacon(_beacon);
		emit UpdatedBeacon(_beacon);
	}

	/**
   * @dev function to create a new product token.
   * After creating a new beacon proxy, the token factory will pass in _data, the encoded function call for initialize.
   * Then factory will call method to set our corporate account as the creator of the new token.
   *
   * @param _productName   						 product name for a new token. The product name has to be unique
   * @param _data											 encoded data for the initialize function call with parameters.
  */
	function createToken(string memory _productName, bytes memory _data) external onlyOwner{
		require(registry[_productName]==address(0), "The product token already exist");

		address newProxyToken = address(new BeaconProxy(address(beacon), _data));
		(bool success, ) = newProxyToken.call(abi.encodeWithSignature("transferOwnership(address)", msg.sender));

		if(success){
			registry[_productName] = newProxyToken;
		}
		emit Create(_productName, success);
	}

	/**
   * @dev function to retrieve a product token address
   * After creating a new beacon proxy, the token factory will pass in _data, the encoded function call for initialize.
   * Then factory will call method to set our corporate account as the creator of the new token.
   *
   * @param _productName   						 product name for the product token.
   * @return address 									 the address of the product token.
  */
	function retrieveToken(string memory _productName) external view returns(address) {
		require(registry[_productName]!=address(0), "This product token does not exist");
		return registry[_productName];
	}

	/**
   * @dev necessary function override from UUPSUpgradeable proxy contract.
  */
	function _authorizeUpgrade(address) internal override onlyOwner {}

}
