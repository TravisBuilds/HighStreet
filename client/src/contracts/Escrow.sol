// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

contract Escrow {

  enum escrowState {
    INITIAL,
    AWAITING_PROCESSING,
    COMPLETE_USER_REFUND,
    COMPLETE
  }

  struct escrowInfo {
    escrowState state;
    uint32 amount;
    uint256 value;
  }

  mapping(address => escrowInfo[]) public escrowList;

  event escrowStateUpdated(address, uint256, escrowInfo);

  function _addEscrow(uint32 _amount, uint256 _value) internal virtual returns (uint256){
    require(_amount > 0, 'Invalid Amount');
    escrowInfo memory info;
    info.state = escrowState.AWAITING_PROCESSING;
    info.amount = _amount;
    info.value = _value;
    escrowList[msg.sender].push(info);
    uint256 id = escrowList[msg.sender].length -1;
    emit escrowStateUpdated(msg.sender, id, info);
    return id;
  }

  function _updateUserCompleted(address buyer, uint256 id) internal virtual {
    require(id >=  0 || id < escrowList[buyer].length, "Invalid id");
    escrowList[buyer][id].state = escrowState.COMPLETE;
    emit escrowStateUpdated(buyer, id, escrowList[buyer][id]);
  }

  function _updateUserRefund(address buyer, uint256 id) internal virtual returns ( uint) {
    require(id >=  0 || id < escrowList[buyer].length, "Invalid id");
    escrowList[buyer][id].state = escrowState.COMPLETE_USER_REFUND;
    emit escrowStateUpdated(buyer, id, escrowList[buyer][id]);
    return escrowList[buyer][id].value;
  }

  function isStateCompleted(escrowState state) public pure virtual returns (bool) {
    return state == escrowState.COMPLETE ||
         state == escrowState.COMPLETE_USER_REFUND;
  }

  function getEscrowHistory(address buyer) external view virtual returns (escrowInfo [] memory) {
    return escrowList[buyer];
  }

  function getRedeemStatus(address buyer, uint256 id) external view virtual returns (escrowState) {
    require(id >=  0 || id < escrowList[buyer].length, "Invalid id");
    return escrowList[buyer][id].state;
  }

}
