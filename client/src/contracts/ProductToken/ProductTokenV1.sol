// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./ProductToken.sol";
import "./interface/INFTMint.sol";

/// @title ProductTokenV1
/// @notice This is version 1 of the product token implementation.
/// @dev This contract builds on top of version 0 by including transaction logics, such as buy and sell transfers
///    and exchange rate computation by including a price oracle.
contract ProductTokenV1 is ProductToken {
	using SafeMathUpgradeable for uint256;

    struct supplierInfo {
        uint256 amount;
        address wallet;
    }

    supplierInfo private supplier;
    IERC20 private high;
    INFTMint private nft;

    function setHigh(address highAddress_) external onlyOwner {
        require(highAddress_!=address(0), "Invalid address");
        high = IERC20(highAddress_);
    }

    function setNft(address address_) external onlyOwner {
        require(address_ != address(0), "Invalid address");
        nft = INFTMint(address_);
    }

    function buy(uint256 maxPrice_) external virtual onlyIfTradable {
        require(maxPrice_ > 0, "invalid max price");

        bool success = high.transferFrom(msg.sender, address(this), maxPrice_);
        require(success, "Purchase failed.");

        (uint256 amount,uint256 change, uint price, uint256 fee)  = _buy(maxPrice_);
        if (amount > 0) {
            if(change > 0) {
                high.transfer(msg.sender, change);
            }
            _updateSupplierFee(fee.mul(1e12).div(4e12));
        }else { // If token transaction failed
            high.transfer(msg.sender, maxPrice_);
        }
    }

    function sell(uint32 amount_) external virtual onlyIfTradable {
        require(balanceOf(msg.sender) >= amount_ || amount_ > 0, 'invalid amount');

        (uint256 price, uint256 fee )= _sellForAmount(amount_);

        bool success = high.transfer(msg.sender, price);
        _updateSupplierFee(fee.mul(1e12).div(2e12));
        require(success, "selling token failed");
    }

    /**
    * @dev When user wants to trade in their token for retail product
    *
    * @param amount_                   amount of tokens that user wants to trade in.
    */
    function tradein(uint32 amount_) external virtual onlyIfTradable returns(uint256){
        require(amount_ > 0, "Amount must be non-zero.");
        require(balanceOf(msg.sender) >= amount_, "Insufficient tokens to burn.");

        (uint256 reimburseAmount, uint fee) = _sellReturn(amount_);

        uint256 tradinReturn = calculateTradinReturn(amount_);
        _updateSupplierFee(fee.mul(1e12).div(2e12).add(tradinReturn));
        reimburseAmount = reimburseAmount.sub(fee);
        uint256 id = _addEscrow(amount_,  reimburseAmount);
        _burn(msg.sender, amount_);

        if(nft != INFTMint(address(0))) {
            for(uint256 index = tradeinCount; index < tradeinCount + amount_; index ++) {
                nft.mint(msg.sender, index);
            }
        }

        tradeinCount = tradeinCount + amount_;
        tradeinReserveBalance = tradeinReserveBalance.add(tradinReturn);

        emit Tradein(msg.sender, amount_);
        return id;
    }

    function setSupplier( address wallet_) external virtual onlyOwner {
        require(wallet_!=address(0), "Address is invalid");
        supplier.wallet = wallet_;
    }

    function claimSupplier(uint256 amount_) external virtual {
        require(supplier.wallet!=address(0), "wallet is invalid");
        require(msg.sender == supplier.wallet, "The address is not allowed");
        if (amount_ <= supplier.amount){
            bool success = high.transfer(msg.sender, amount_);
            if (success) {
                supplier.amount = supplier.amount.sub(amount_);
            }
        }
    }

    function _updateSupplierFee(uint256 fee) internal virtual {
        if( fee > 0 ) {
            supplier.amount = supplier.amount.add(fee);
        }
    }
}
