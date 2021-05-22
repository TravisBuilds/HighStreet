pragma solidity ^0.8.2;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductBeaconProxy is BeaconProxy, Ownable{
    // below list all state variable for a product proxy.


    constructor(address _beacon, bytes memory _data) BeaconProxy(_beacon, _data) public {

    }

    //Changes the proxy to use a new beacon.
    function SetBeacon(address _beacon, bytes memory _data) external onlyOwner {
        require(
            Address.isContract(_beacon),
            "BeaconProxy: beacon is not a contract"
        );
        require(
            Address.isContract(IBeacon(_beacon).implementation()),
            "BeaconProxy: beacon implementation is not a contract"
        );
        _setBeacon(_beacon, _data);
    }


    //The below list all functions that a proxy will be using.

}