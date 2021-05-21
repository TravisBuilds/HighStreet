pragma solidity ^0.8.2;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductBeanconProxy is BeaconProxy,Ownable{
    
    constructor(address beacon, bytes memory data) BeaconProxy(beacon,data) public {

    }

    // //Changes the proxy to use a new beacon.
    // function SetBeacon(address beacon, bytes memory data) public virtual {
    //     require(
    //         Address.isContract(beacon),
    //         "BeaconProxy: beacon is not a contract"
    //     );
    //     require(
    //         Address.isContract(IBeacon(beacon).implementation()),
    //         "BeaconProxy: beacon implementation is not a contract"
    //     );
    //     _setBeacon(beacon,data);
    // }

    //Returns the current implementation address of the associated beacon.
    function GetImplementation() public view  returns (address) {
        _implementation();
    }

}