pragma solidity ^0.8.2;

import "./ProductToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFactory is Ownable { // is Initializable{

	mapping(string => address) registry;

	function createToken(string memory _productName, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) public onlyOwner {
		require(registry[_productName]==address(0), "The product token already exist");
		address newToken = address(new ProductToken(_reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve));
		registry[_productName] = newToken;
	}

	function retrieveToken(string memory _productName) public view returns(address) {
		require(registry[_productName]!=address(0), "This product token does not exist");
		return registry[_productName];
	}


}
