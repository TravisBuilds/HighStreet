pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DaiToken {

    constructor(address _daiToken)
    public 
    {
        daitoken = IERC20(addr);
    }

    function _dai_approves(uint256 _value) public {
        daitoken.approve(address(this), _value);
    }

    function _dai_allowance(address _owner, address _spender) public view returns(uint256) {
        return daitoken.allowance(_owner, _spender);
    }

    function _dai_transferFroms(address _to, uint256 _value) public {
        daitoken.transferFrom(address(this), _to, _value);
    }

    function _dai_transfers(address _addr, uint256 _value) external {
        require(daitoken.transfer(_addr, _value));
    }

    function _dai_balanceOf(address _addr) public view returns(uint256){
        return daitoken.balanceOf(_addr);
    }
}

