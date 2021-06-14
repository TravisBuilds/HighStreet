pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
* @title Airdrop
* @dev This is an implementation of a smart contract that will manage the airdrop of our platform token
*/
contract Airdrop {

    event Send(address tokenAddress, uint256 total);        // Event emitted when airdrops are sent out.

    /**
       * @dev Function that sends token equally to all entitled addresses.
       *
       * @param token                   the token type to be sent out.          
       * @param contributors            list of receivers
       * @param balance                 amount each address will receive.
    */
    function sendEqual(address token, address[] calldata contributors, uint256 balance) external {
        require(contributors.length < 256, "Contributors length is more than 256.");
        require(token != address(0), "Token address can not be zero");
        uint256 total = 0;
        IERC20 erc20token = IERC20(token);
        uint8 i = 0;
        for (i; i < contributors.length; i++) {
            erc20token.transferFrom(msg.sender, contributors[i], balance);
            total += balance;
        }
        emit Send(token, total);
    }

    /**
       * @dev Function that sends token to entitled addresses based on a pre-determined list of allocations.
       *
       * @param token                   the token type to be sent out.          
       * @param contributors            list of receivers
       * @param balances                 amount each address will receive.
    */
    function send(address token, address[] calldata contributors, uint256[] calldata balances) external {
        require(token != address(0), "Token address can not be zero");
        require(contributors.length < 256, "Contributors length is more than 256.");
        require(contributors.length == balances.length," Contributors length is not equal balances length");
        uint256 total = 0;
        IERC20 erc20token = IERC20(token);
        uint8 i = 0;
        for (i; i < contributors.length; i++) {
            erc20token.transferFrom(msg.sender, contributors[i], balances[i]);
            total += balances[i];
        }
        emit Send(token, total);
    }
} 