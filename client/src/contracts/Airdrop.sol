pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop {

    event Send(address tokenAddress, uint256 total);
    event SendEther(uint256 total);

    //Each address is airdroped equally
    function sendEqual(address token, address[] calldata contributors, uint256 balance) public {
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
    //Each address is not equally airdroped
    function send(address token, address[] calldata contributors, uint256[] calldata balances) public {
        require(token != address(0), "Token address can not be zero");
        uint256 total = 0;
        IERC20 erc20token = IERC20(token);
        uint8 i = 0;
        for (i; i < contributors.length; i++) {
            erc20token.transferFrom(msg.sender, contributors[i], balances[i]);
            total += balances[i];
        }
        emit Send(token, total);
    }
    //airdrop ether equally
    // function sendEtherEqual(address payable[] calldata contributors, uint256 balance) public payable {
    //     uint256 total = 0;
    //         uint8 i = 0;
    //         for (i; i < contributors.length; i++) {
    //             contributors[i].transfer(balance);
    //             total += balance;
    //         }
    //         emit SendEther(total);
    // }
} 