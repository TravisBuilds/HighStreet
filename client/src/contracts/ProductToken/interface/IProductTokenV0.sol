// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IProductTokenV0 {


    struct supplierInfo {
        uint256 amount;
        address wallet;
    }
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastReward;
        uint256[] records;
    }
    struct PoolInfo {
        uint256 amount; // record the entire pool vaule
        uint256 accRewardPerShare; // Accumulated reward per share
        uint256 tokenReward; //total reward
    }

    function initialize(string memory _name, string memory _symbol, address _bondingCurveAddress,
        uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve) external;

    function setBondingCurve(address _address) external;

    function launch() external;

    function pause() external;

    function getAvailability() external view returns (uint32 available);

    function getCurrentPrice() external view returns (uint256 price);

    function getPriceForN(uint32 _amountProduct) external view returns (uint256 price);

    function calculateBuyReturn(uint256 _amountReserve) external view returns (uint32 mintAmount);

    function calculateSellReturn(uint32 _amountProduct) external view returns (uint256 soldAmount);

    function setupVoucher(address addr_, uint256 tokenId_) external;

    function claimVoucher(uint256 tokenId_) external;

    function buyByVoucher(uint256 tokenId_, uint256 maxPrice_) external;

    function sellByVoucher(uint256 tokenId_, uint32 amount_) external;

    function tradeinVoucher(uint256 tokenId_, uint32 amount_) external;

    function setSupplier( address wallet_) external;

    function claimSupplier(uint256 tokenId_, uint256 amount_) external;

    function getSupplierBalance() external view returns (uint256);

    function getUserReward(address addr_) external view returns (uint256);

    function getUserInfo(address addr_) external view returns( UserInfo memory);

    function getPoolInfo() external view returns( PoolInfo memory);

    function getSupplierInfo() external view returns( supplierInfo memory);

    function updateUserCompleted(address buyer, uint256 id) external;

    function updateUserRefund(address buyer, uint256 id) external;

    function setManager(address addr_) external;

    function getManager() external view returns(address);
}
