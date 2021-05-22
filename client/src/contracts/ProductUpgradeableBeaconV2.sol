pragma solidity ^0.8.2;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductUpgradeableBeaconV2 is UpgradeableBeacon{
    
    constructor(address _implementation) UpgradeableBeacon(_implementation) public {
    
    }
}