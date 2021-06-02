pragma solidity ^0.8.2;

// import "./ProductToken.sol";
import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TokenFactory is Initializable, UUPSUpgradeable, OwnableUpgradeable { // is Initializable{

	// address daiAddress;
	// address chainlinkAddress;
	IBeacon public beacon;
	mapping(string => address) registry;

	event create(string name, bool state);

	function initialize(address _beacon) public initializer{
		__Ownable_init();
		UpdateBeacon(_beacon);
	}

	function UpdateBeacon(address _beacon) public onlyOwner {
		require( Address.isContract(_beacon), "Invalid Beacon address");
		beacon = IBeacon(_beacon);
	}

	function createToken(string memory _productName, bytes memory _data) public onlyOwner{
		require(registry[_productName]==address(0), "The product token already exist");
		address newProxyToken = address(new BeaconProxy(address(beacon), '0x'));
		newProxyToken.delegatecall(_data);

		registry[_productName] = newProxyToken;
	}

	function createTokenV2(string memory _productName, bytes memory _data) public onlyOwner{
		require(registry[_productName]==address(0), "The product token already exist");

		address newProxyToken = address(new BeaconProxy(address(beacon), '0x'));
		newProxyToken.delegatecall(_data);
		(bool success, ) = newProxyToken.call(abi.encodeWithSignature("setCreator(address)",msg.sender));

		if(success){
			registry[_productName] = newProxyToken;
		}
		create(_productName, success);
	}

	function retrieveToken(string memory _productName) public view returns(address) {
		require(registry[_productName]!=address(0), "This product token does not exist");
		return registry[_productName];
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}

	function getOwner() public returns (address) {
		return owner();
	}
}
