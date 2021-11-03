// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IStored {
    struct Deposit {
        // @dev token amount the user deposit
        uint256 tokenAmount;
        // @dev the block number that user deposit
        uint256 blockNumber;
    }

    struct Withdrawal {
        // @dev token amount the user withdraw
        uint256 tokenAmount;
        // @dev the block number that user withdraw
        uint256 blockNumber;
    }

    struct User {
        // @dev Available token amount that user can withdraw
        uint256 tokenBalance;
        // @dev An array of user's deposit record
        Deposit[] deposits;
        // @dev An array of user's withdrawal record
        Withdrawal[] withdrawals;
    }

    function pause() external;

    function unpause() external;

    function setManager(address newManager_) external;

    function depositHigh(uint256 amount_) external;

    function withdrawHigh(uint256 amount_) external;

    function updateUserBalance(
        address userAddr_,
        uint256 amount_
    ) external;

    function getUserBalance(address userAddr_) external view returns (uint256);

    function getDepositHistory(
        address userAddr_, 
        uint256 depositId_
    ) external view returns (Deposit memory);

    function getWithdrawalHistory(
        address userAddr_, 
        uint256 withdrawalId_
    ) external view returns (Withdrawal memory);
}