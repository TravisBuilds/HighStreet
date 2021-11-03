// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interface/IStored.sol";

contract Stored is IStored, Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;
    IERC20 public high;    
    address public managerAddress;

    modifier onlyManager() {
        require(msg.sender == managerAddress);
        _;
    }

    /// @dev User storage, maps user address to their data record
    mapping(address => User) public users;

    event UserDepositHigh(address indexed user, uint256 amount);
    event UserWithdrawHigh(address indexed user, uint256 amount);
    event ManagerUpdateBalance(address indexed user, uint256 amount);

    constructor(address high_) {
        high = IERC20(high_);
    }

    function pause() external override onlyOwner {
        _pause();
    }

    function unpause() external override onlyOwner {
        _unpause();
    }

    function setManager(address newManager_) external override onlyOwner {
        require(newManager_ != address(0));
        managerAddress = newManager_;
    }

    function depositHigh(uint256 amount_) external override nonReentrant whenNotPaused {
        require(amount_ > 0, 'Invalid amount');
        require(high.balanceOf(msg.sender) >= amount_, 'The balance of high is not enough');

        User storage user = users[msg.sender];

        high.transferFrom(msg.sender, address(this), amount_);
        Deposit memory deposit = 
            Deposit({
                tokenAmount: amount_,
                blockNumber: block.number
            });
        user.deposits.push(deposit);
        emit UserDepositHigh(msg.sender, amount_);
    }

    function withdrawHigh(uint256 amount_) external override nonReentrant whenNotPaused {
        User storage user = users[msg.sender];

        require(amount_ > 0, 'Invalid amount');
        require(amount_ <= user.tokenBalance, 'The user balance is insufficient');
        require(high.balanceOf(address(this)) >= amount_, 'The liquidity is not enough');

        user.tokenBalance = user.tokenBalance.sub(amount_);
        high.transfer(msg.sender, amount_);

        Withdrawal memory withdrawal = 
            Withdrawal({
                tokenAmount: amount_,
                blockNumber: block.number
            });
        user.withdrawals.push(withdrawal);
        emit UserWithdrawHigh(msg.sender, amount_);
    }

    function updateUserBalance(address userAddr_, uint256 amount_) external override whenNotPaused onlyManager {
        require(userAddr_ != address(0), 'Invalid user address');
        require(amount_ > 0, 'Invalid amount');

        User storage user = users[userAddr_];

        user.tokenBalance = user.tokenBalance + amount_;
        emit ManagerUpdateBalance(userAddr_, amount_);
    }

    function getUserBalance(address userAddr_) external view override returns (uint256) {
        return users[userAddr_].tokenBalance;
    }

    function getDepositHistory(address userAddr_, uint256 depositId_) external view override returns (Deposit memory) {
        return users[userAddr_].deposits[depositId_];
    }

    function getWithdrawalHistory(address userAddr_, uint256 withdrawalId_) external view override returns (Withdrawal memory) {
        return users[userAddr_].withdrawals[withdrawalId_];
    }
}