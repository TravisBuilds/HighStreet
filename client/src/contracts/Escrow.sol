// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

contract Escrow {

  enum escrowState {
    INITIAL,
    AWAITING_SERVER_CHECK,
    AWAITING_DELIVERY,
    AWAITING_USER_APPROVAL,
    COMPLETE_USER_REFUND,
    COMPLETE
  }

  struct escrowInfo {
    escrowState state;
    uint32 amount;
    uint value;
  }

  mapping(address => escrowInfo[]) public escrowList;
  
  event escrowStateUpdated(address, uint, escrowInfo);

  function _addEscrow(uint32 _amount, uint _value) internal virtual returns (uint){
    require(_amount > 0, 'Invalid Amount');
    escrowInfo memory info;
    info.state = escrowState.AWAITING_SERVER_CHECK;
    info.amount = _amount;
    info.value = _value;
    escrowList[msg.sender].push(info);
    uint id = escrowList[msg.sender].length -1;
    emit escrowStateUpdated(msg.sender, id, info);
    return id;
  }

  function _updateServerCheck(address buyer, uint id) internal virtual{
    require(id >=  0 || id < escrowList[buyer].length , "Invalid id");
    escrowList[buyer][id].state = escrowState.AWAITING_DELIVERY;
    emit escrowStateUpdated(buyer, id, escrowList[buyer][id]);
  }

  function _confirmDelivery(address buyer, uint id) internal virtual{
    require(id >=  0 || id < escrowList[buyer].length , "Invalid id");
    require(escrowList[buyer][id].state == escrowState.AWAITING_DELIVERY, "Invalid state");
    escrowList[buyer][id].state = escrowState.AWAITING_USER_APPROVAL;
    emit escrowStateUpdated(buyer, id, escrowList[buyer][id]);
  }

  function _updateUserCompleted(address buyer, uint id) internal virtual{
    require(id >=  0 || id < escrowList[buyer].length , "Invalid id");
    escrowList[buyer][id].state = escrowState.COMPLETE;
    emit escrowStateUpdated(buyer, id, escrowList[buyer][id]);
  }

  function _updateUserRefund(address buyer, uint id) internal virtual returns ( uint) {
    require(id >=  0 || id < escrowList[buyer].length , "Invalid id");
    escrowList[buyer][id].state = escrowState.COMPLETE_USER_REFUND;
    emit escrowStateUpdated(buyer, id, escrowList[buyer][id]);
    return escrowList[buyer][id].value;
  }

  function isStateCompleted(escrowState state) public pure virtual returns (bool){
    return state == escrowState.COMPLETE ||
         state == escrowState.COMPLETE_USER_REFUND;
  }

  function getBuyerHistory(address buyer) external view virtual returns (escrowInfo [] memory) {
    return escrowList[buyer];
  }

  function getRedeemStatus(address buyer, uint id) external view virtual returns (escrowState){
    require(id >=  0 || id < escrowList[buyer].length , "Invalid id");
    return escrowList[buyer][id].state;
  }

  function getEscrowStateByValue (escrowState state) public pure virtual returns (string memory) {
    if (escrowState.INITIAL == state) return "INITIAL";
    if (escrowState.AWAITING_SERVER_CHECK == state) return "AWAITING_SERVER_CHECK";
    if (escrowState.AWAITING_DELIVERY == state) return "AWAITING_DELIVERY";
    if (escrowState.AWAITING_USER_APPROVAL == state) return "AWAITING_USER_APPROVAL";
    if (escrowState.COMPLETE_USER_REFUND == state) return "COMPLETE_USER_REFUND";
    if (escrowState.COMPLETE == state) return "COMPLETE";
    return "";
  }

}
