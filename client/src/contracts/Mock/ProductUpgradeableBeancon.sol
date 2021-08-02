pragma solidity ^0.8.2;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ProductUpgradeableBeacon
/// @notice This is will be retired. There is no need to create a custom implementation of the UpgradeableBeacon.
contract ProductUpgradeableBeacon is UpgradeableBeacon{
    
  /**
   * @dev constructor function.
   *
   * @param _implementation             	address for the implementation logic
   *
  */
    constructor(address _implementation) UpgradeableBeacon(_implementation) public {
    
    }
}