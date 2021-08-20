pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
* @title HSToken
* @notice we plan to support HSToken as a utility token.
* Users who purchase products using HSToken are automatically enrolled in a liquidity mining pool
* This feature will be implemented in Version 2 of ProductToken.
* @dev This is an implementation of the ERC20 token that will be used as utility token on our platform.
*/
contract HSToken is ERC20, Ownable {
    uint256 private constant maxSupply = 100000000 * 1e18;     // the total supply

    /**
    * @dev constructor function.
    *
    */
    constructor() public ERC20("Street Token", "TKN"){
        
    }

} 