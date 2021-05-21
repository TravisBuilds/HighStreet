pragma solidity ^0.8.2;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract ProductUpgradeableBeancon is UpgradeableBeacon{
    
    constructor(address implementation_) UpgradeableBeacon(implementation_) public {
    }
}