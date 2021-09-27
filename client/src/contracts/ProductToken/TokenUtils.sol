pragma solidity ^0.8.3;

import {AggregatorV3Interface as AggregatorV3Interface_v08 } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

contract TokenUtils is Ownable {
	using SafeMathUpgradeable for uint256;

    uint256 constant public  INDEX_ETH  = 0;
    uint256 constant public  INDEX_HIGH = 1;
    uint256 constant public  INDEX_DAI  = 2;

    uint16 constant public  FEED_TYPE_NONE = 0;
    uint16 constant public  FEED_TYPE_ONE  = 1;
    uint16 constant public  FEED_TYPE_TWO  = 2;

    struct currencyInfo {
        string name;
        address addr;
        address feed;
        address feed2;
        uint16 feedType;
        bool isSupport; //is support for tradeable
    }
    currencyInfo[] public currencyList;

    constructor() {
        addCurrency('ETH', address(0), address(0), address(0), false);
        addCurrency('HIGH', address(0), address(0), address(0), false);
        addCurrency('DAI', address(0), address(0), address(0), false);
    }


    function updateCurrency(uint256 ids_, bool isSupport_) external onlyOwner {
        currencyInfo storage info = currencyList[ids_];
        info.isSupport = isSupport_;
    }

    function updateCurrency(uint256 ids_, string memory name_, address addr_, address feed_,
        address feed2_, bool isSupport_) external onlyOwner {
        currencyInfo storage info = currencyList[ids_];
        info.name = name_;
        info.addr = addr_;
        if(feed_ != address(0)) {
            if(feed2_ != address(0)) {
                info.feedType = FEED_TYPE_TWO;
                info.feed2 = feed2_;
            } else {
                info.feedType = FEED_TYPE_ONE;
            }
            info.feed = feed_;
        } else {
            info.feedType = FEED_TYPE_NONE;
        }
        info.isSupport = isSupport_;
    }

    function addCurrency(string memory name_, address addr_, address feed_, address feed2_, bool isSupport_) public onlyOwner {
        currencyInfo memory info;
        info.name = name_;
        info.addr = addr_;
        if(feed_ != address(0)) {
            if(feed2_ != address(0)) {
                info.feedType = FEED_TYPE_TWO;
                info.feed2 = feed2_;
            } else {
                info.feedType = FEED_TYPE_ONE;
            }
            info.feed = feed_;
        } else {
            info.feedType = FEED_TYPE_NONE;
        }
        info.isSupport = isSupport_;
        currencyList.push(info);
    }

    function getCurrencyList() external view returns( currencyInfo [] memory) {
        return currencyList;
    }

    function getAddressByIds(uint256 ids_) external view returns (address) {
        require(ids_ > 0 || ids_ < currencyList.length, 'invalid ids');
        require(currencyList[ids_].isSupport, 'not support');
        return currencyList[ids_].addr;
    }

    function isValidIds(uint256 ids_) external view returns (bool) {
        if(ids_ > 0 || ids_ < currencyList.length){
            return true;
        }
        return false;
    }

    function isSupportIds(uint256 ids_) external view returns (bool) {
        if(ids_ > 0 || ids_ < currencyList.length){
            if(currencyList[ids_].isSupport) {
                return true;
            }
        }
        return false;
    }

    function toAccValue(uint256 value_, uint ids_) public view returns(uint256) {
        currencyInfo storage currency = currencyList[ids_];
        if (currency.feedType == FEED_TYPE_TWO) {
            return value_
                    .mul(uint256(_getLatestFeed(currency.feed2)))
                    .div(uint256(_getLatestFeed(currency.feed)));
        } else if (currency.feedType == FEED_TYPE_ONE) {
            return value_
                    .mul(10**18)
                    .div(uint256(_getLatestFeed(currency.feed)));
        }
        return value_;
    }

   function toOrigValue(uint256 value_, uint ids_) public view returns(uint256) {
        currencyInfo storage currency = currencyList[ids_];
        if (currency.feedType == FEED_TYPE_TWO) {
            return value_
                    .mul(uint256(_getLatestFeed(currency.feed)))
                    .div(uint256(_getLatestFeed(currency.feed2)));
        } else if (currency.feedType == FEED_TYPE_ONE) {
            return value_
                    .mul(uint256(_getLatestFeed(currency.feed)))
                    .div(10**18);
        }
        return value_;
    }

    function _getLatestFeed(address feed_) internal view virtual returns (int) {
        (
          ,
          int price,
          ,
          ,
        ) = AggregatorV3Interface_v08(feed_).latestRoundData();
        require(price > 0, "Invalid Exchange rate");
        return price;
    }

}
