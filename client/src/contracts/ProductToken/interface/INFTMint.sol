// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

interface INFTMint {
    function mint(address, uint256 tokenId) external;
}