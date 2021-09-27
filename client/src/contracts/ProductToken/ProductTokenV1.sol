// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./ProductToken.sol";
import "./interface/IVNFT.sol";

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
    struct voucherInfo {
        address addr;
        uint256 tokenId;
    }

    supplierInfo public supplier;
    voucherInfo public voucher;
    IERC20 high;

    function setHigh(address highAddress_) external onlyOwner {
        require(highAddress_!=address(0), "Invalid address");
        high = IERC20(highAddress_);
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
            _updateSupplierFee(fee.mul(1e12).div(8e12));
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
    function tradein(uint32 amount_) external virtual onlyIfTradable {
        require(amount_ > 0, "Amount must be non-zero.");
        require(balanceOf(msg.sender) >= amount_, "Insufficient tokens to burn.");

        (uint256 reimburseAmount, uint fee) = _sellReturn(amount_);

        uint256 tradinReturn = calculateTradinReturn(amount_);
        _updateSupplierFee(fee.mul(1e12).div(2e12).add(tradinReturn));
        reimburseAmount = reimburseAmount.sub(fee);
        _addEscrow(amount_,  reimburseAmount);
        _burn(msg.sender, amount_);
        tradeinCount = tradeinCount + amount_;
        tradeinReserveBalance = tradeinReserveBalance.add(tradinReturn);

        emit Tradein(msg.sender, amount_);
    }

    function updateSupplierInfo( address wallet_) external onlyOwner {
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

    /**
    * @dev this function returns the amount of reserve balance that the supplier can withdraw from the dapp.
    */
    function getSupplierBalance() public view virtual returns (uint256) {
        return supplier.amount;
    }

    /**
    * @dev A method that refunds the value of a product to a buyer/customer.
    *
    * @param buyer_       The wallet address of the owner whose product token is under the redemption process
    * @param value_       The market value of the token being redeemed
    *
    */
    function _refund(address buyer_, uint256 value_) internal virtual override {
        bool success = high.transfer(buyer_, value_);
        require(success, "refund token failed");
    }

    function withdrawHigh(uint256 amount_, address to_) external virtual onlyOwner {
        require(to_ != address(0), "invalid address");
        require(amount_ <= high.balanceOf(address(this)), 'invalid amount');
        high.transfer(to_, amount_);
    }

}
