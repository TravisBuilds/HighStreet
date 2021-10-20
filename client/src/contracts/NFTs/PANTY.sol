// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PANTY is Context, ERC721Enumerable, Ownable {

    uint256 public constant HARD_CAP = 250;
    address private _manager;
    string private baseURI;

    constructor() ERC721("FOMO\xE2\x80\x99s Secret", "PANTY") {
        baseURI = 'https://highstreet.market/fomosecret/';
        _manager = _msgSender();
    }

    function setManager(address addr_) external onlyOwner {
        require(addr_ != address(0), 'invalid address');
        _manager = addr_;
    }

    function manager() external view returns(address) {
        return _manager;
    }

    function setBaseURI(string memory uri_) external {
        require(_msgSender() == owner() || _msgSender() == _manager, 'permission denied');
        baseURI = uri_;
    }

    function mint(address to_, uint256 tokenId_) external {
        require(_msgSender() == owner() || _msgSender() == _manager, 'permission denied');
        require(tokenId_ >= 0 && tokenId_ < HARD_CAP, "cap exceeded");
        _safeMint(to_, tokenId_);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

}



