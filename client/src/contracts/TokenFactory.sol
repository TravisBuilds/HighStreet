pragma solidity ^0.8.2;

import "./ProductToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFactory is Ownable { // is Initializable{

	address daiAddress;
	address chainlinkAddress;
	mapping(string => address) registry;

	constructor(address _daiAddress, address _chainlinkAddress) public {
		require(_daiAddress!=address(0), "Invalid dai contract address");
    require(_chainlinkAddress!=address(0), "Invalid chainlink contract address");

		daiAddress = _daiAddress;
		chainlinkAddress = _chainlinkAddress;
	}

	function createToken(string memory _productName, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) public onlyOwner {
		require(registry[_productName]==address(0), "The product token already exist");
		address newToken = address(new ProductToken(_reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve, daiAddress, chainlinkAddress));
		registry[_productName] = newToken;
	}

	function retrieveToken(string memory _productName) public view returns(address) {
		require(registry[_productName]!=address(0), "This product token does not exist");
		return registry[_productName];
	}


}
