pragma solidity ^0.8.2;

// import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ProductToken.sol";

contract TokenFactory { // is Initializable{

	address public owner;
	address daiAddress;
	mapping(string => address) registry;

	constructor(address _daiAddress) public {
		owner = msg.sender;
		daiAddress = _daiAddress;
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

	function createToken(string memory _productName, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) public onlyOwner {
		require(registry[_productName]==address(0), "The product token already exist");
		address newToken = address(new ProductToken(daiAddress, _reserveRatio, _maxTokenCount, _supplyOffset, _baseReserve));
		registry[_productName] = newToken;
	}

	function retrieveToken(string memory _productName) public view returns(address) {
		require(registry[_productName]!=address(0), "This product token does not exist");
		return registry[_productName];
	}


}
