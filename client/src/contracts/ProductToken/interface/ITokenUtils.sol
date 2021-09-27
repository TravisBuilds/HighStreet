

pragma solidity ^0.8.3;

interface ITokenUtils{

    struct currencyInfo {
        string name;
        address addr;
        address feed;
        address feed2;
        uint16 feedType;
        bool isSupport; //is support for tradeable
    }

    function updateCurrency(uint256 ids_, bool isSupport_) external;
    function updateCurrency(uint256 ids_, string memory name_, address addr_, address feed_,
        address feed2_, bool isSupport_) external;
    function addCurrency(string memory name_, address addr_, address feed_, address feed2_,
        bool isSupport_) external;
    function getCurrencyList() external view returns( currencyInfo [] calldata);
    function getAddressByIds(uint256 ids_) external view returns (address);
    function toAccValue(uint256 value_, uint ids_) external view returns(uint256);
    function toOrigValue(uint256 value_, uint ids_) external view returns(uint256);
    function isValidIds(uint256 ids_) external view returns (bool);
    function isSupportIds(uint256 ids_) external view returns (bool);
}

