pragma solidity ^0.8.2;

// import "./ProductToken.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFactory is Ownable { // is Initializable{

	// address daiAddress;
	// address chainlinkAddress;
	address public beacon;
	mapping(string => address) registry;

	// constructor(address _daiAddress, address _chainlinkAddress, address _beacon) public {
	constructor(address _beacon) public {
		// require(_daiAddress!=address(0), "Invalid dai contract address");
  	// require(_chainlinkAddress!=address(0), "Invalid chainlink contract address");
  	require(_beacon !=address(0), "Invalid Beacon address");
		// has to check if _beacon implements IBeacon

		// daiAddress = _daiAddress;
		// chainlinkAddress = _chainlinkAddress;
		beacon=_beacon;
	}

	function updateBeacon(address _newBeacon) public onlyOwner {
		require(_newBeacon!=address(0), "Invalid Beacon address");
		// has to check if _beacon implements IBeacon
		beacon=_newBeacon;
	}

	function createToken(string memory _productName, bytes memory _data) public onlyOwner {
		require(registry[_productName]==address(0), "The product token already exist");
		address newProxyToken = address(new BeaconProxy(beacon, _data));
		registry[_productName] = newProxyToken;
	}

	function retrieveToken(string memory _productName) public view returns(address) {
		require(registry[_productName]!=address(0), "This product token does not exist");
		return registry[_productName];
	}


}
