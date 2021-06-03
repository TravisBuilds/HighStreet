pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
* @title HSToken
* @notice we plan to support HSToken as a utility token. 
* Users who purchase products using HSToken are automatically enrolled in a liquidity mining pool
* This feature will be implemented in Version 2 of ProductToken.
* @dev This is an implementation of the ERC20 token that will be used as utility token on our platform.
*/
contract HSToken is ERC20, Ownable {
    uint256 private constant maxSupply = 100000000 * 1e18;     // the total supply

    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint256;
    EnumerableSet.AddressSet private _minters;

    /**
    * @dev constructor function.
    *
    */
    constructor() public ERC20("Street Token", "TKN"){
        // _mint(msg.sender, preMineSupply);
        addMinter(msg.sender);
    }

    /**
    * @dev mint function. mint tokens to a designated address.
    *
    * @param _to                    the designated address.
    * @param _amount                number of tokens to be minted to an address.
    * @return bool                  status of mint
    */
    function mint(address _to, uint256 _amount) public onlyMinter returns (bool) {
        if (_amount.add(totalSupply()) > maxSupply) {
            return false;
        }
        _mint(_to, _amount);
        return true;
    }

    /**
    * @dev grant an address minting power.
    *
    * @param _addMinter             the address to be added as a minter.
    * @return bool                  status of add
    */
    function addMinter(address _addMinter) public onlyOwner returns (bool) {
        require(_addMinter != address(0), "HSToken: _addMinter is the zero address");
        return EnumerableSet.add(_minters, _addMinter);
    }

    /**
    * @dev remove an address of its minting power.
    *
    * @param _delMinter             the address to be deleted from the minter list.
    * @return bool                  status of remove
    */
    function delMinter(address _delMinter) public onlyOwner returns (bool) {
        require(_delMinter != address(0), "HSToken: _delMinter is the zero address");
        return EnumerableSet.remove(_minters, _delMinter);
    }

    /**
    * @dev return the length of the list of current minters.
    *
    * @return uint256               number of minters.
    */
    function getMinterLength() public view returns (uint256) {
        return EnumerableSet.length(_minters);
    }

    /**
    * @dev check whether an address has minter access.
    *
    * @param _account               the address in question.
    * @return bool                  access confirmation.
    */
    function isMinter(address _account) public view returns (bool) {
        return EnumerableSet.contains(_minters, _account);
    }

    /**
    * @dev get minter address of the minter at particular index. This will be used with our iterator function.
    *
    * @param _index                 the index of minter.
    * @return address               minter address.
    */
    function getMinter(uint256 _index) public view onlyOwner returns (address){
        require(_index <= getMinterLength() - 1, "HSToken: _index out of bounds");
        return EnumerableSet.at(_minters, _index);
    }

    // modifier for mint function
    modifier onlyMinter() {
        require(isMinter(msg.sender), "HSToken: It is not the minter");
        _;
    }

} 