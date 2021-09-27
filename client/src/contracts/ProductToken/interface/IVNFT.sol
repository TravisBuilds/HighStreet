// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

interface IVNFT {

    function unitsInToken(uint256 tokenId) external view returns (uint256 units);

    function approve(address to, uint256 tokenId, uint256 units) external;

    function allowance(uint256 tokenId, address spender) external view returns (uint256 allowed);

    function split(uint256 tokenId, uint256[] calldata units) external returns (uint256[] memory newTokenIds);

    function merge(uint256[] calldata tokenIds, uint256 targetTokenId) external;

    function transferFrom(address from, address to, uint256 tokenId,
        uint256 units) external returns (uint256 newTokenId);

    function safeTransferFrom(address from, address to, uint256 tokenId,
        uint256 units, bytes calldata data) external returns (uint256 newTokenId);

    function transferFrom(address from, address to, uint256 tokenId, uint256 targetTokenId,
        uint256 units) external;

    function safeTransferFrom(address from, address to, uint256 tokenId, uint256 targetTokenId,
        uint256 units, bytes calldata data) external;

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);

}