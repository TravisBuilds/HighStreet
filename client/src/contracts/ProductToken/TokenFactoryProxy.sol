// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title TokenFactoryProxy
contract TokenFactoryProxy is ERC1967Proxy {

    constructor (address _delegate, bytes memory _data) ERC1967Proxy(_delegate, _data)  {
    }

    function getImplementation()  public returns (address) {
        return _getImplementation();
    }

}
