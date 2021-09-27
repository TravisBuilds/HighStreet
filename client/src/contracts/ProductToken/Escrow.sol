// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

contract Escrow {

  /**
     * @dev this is the enum representation of shipping status.
     * INITIAL                When an escrow has been created
     * AWAITING_PROCESSING    When an escrow has been locked and product is in transit
     * COMPLETE_USER_REFUND   When an product shipment has failed and user refund is happening
     * COMPLETE               When an shipment is delivered successfully
  */
  enum escrowState {
    INITIAL,
    AWAITING_PROCESSING,
    COMPLETE_USER_REFUND,
    COMPLETE
  }

  /**
     * @dev this is the struct class of escrow.
     * state                  The current shipping status
     * amount                 The amount of token being redeemed
     * value                  The actual reserve token being locked up
  */
  struct escrowInfo {
    escrowState state;
    uint32 amount;
    uint256 value;
  }

  mapping(address => escrowInfo[]) public escrowList;       // A list of user to escrow being saved

  event escrowStateUpdated(address, uint256, escrowInfo);   // Event that's fired when a new redeem request has been created.

  /**
     * @dev Create a new escrow and add it to the list of pending escrows.
     *
     * @param _amount        The amount of tokens being redeemed
     * @param _value         The value of the product in reserve token
     * @return               The id of the escrow created
  */
  function _addEscrow(uint32 _amount, uint256 _value) internal virtual returns (uint256){
    require(_amount > 0, 'Invalid Amount');
    escrowInfo memory info;
    info.state = escrowState.AWAITING_PROCESSING;
    info.amount = _amount;
    info.value = _value;
    escrowList[msg.sender].push(info);
    uint256 _id = escrowList[msg.sender].length -1;
    emit escrowStateUpdated(msg.sender, _id, info);
    return _id;
  }

  /**
     * @dev Update state for the redemption process to completed
     * This is triggered by our backend after shipment partner has confirmed delivery
     *
     * @param _buyer        The wallet address of the user
     * @param _id           The cached id of the escrow, retrieved from database
  */
  function _updateUserCompleted(address _buyer, uint256 _id) internal virtual {
    require(_id >=  0 || _id < escrowList[_buyer].length, "Invalid id");
    require(!isStateCompleted(escrowList[_buyer][_id].state), "already completed");

    escrowList[_buyer][_id].state = escrowState.COMPLETE;
    emit escrowStateUpdated(_buyer, _id, escrowList[_buyer][_id]);
  }

  /**
     * @dev Update state for the redemption process to refunded
     * This is triggered by our backend after shipment partner has confirmed deilvery failed
     *
     * @param _buyer        The wallet address of the user
     * @param _id           The cached id of the escrow, retrieved from database
     * @return              The amount of reserve currency in dai that needs to be refunded.
  */
  function _updateUserRefund(address _buyer, uint256 _id) internal virtual returns (uint) {
    require(_id >=  0 || _id < escrowList[_buyer].length, "Invalid id");
    require(!isStateCompleted(escrowList[_buyer][_id].state), "already completed");

    escrowList[_buyer][_id].state = escrowState.COMPLETE_USER_REFUND;
    emit escrowStateUpdated(_buyer, _id, escrowList[_buyer][_id]);
    return escrowList[_buyer][_id].value;
  }

  /**
     * @dev Helper function to check whether a escrow state is completed
     *
     * @param _state       The state to be checked
  */
  function isStateCompleted(escrowState _state) public pure virtual returns (bool) {
    return _state == escrowState.COMPLETE ||
         _state == escrowState.COMPLETE_USER_REFUND;
  }

  /**
     * @dev Return the list of all escrows created for a certain user
     *
     * @param _buyer       The address of the buyer
     * @return             A list of past escrows
  */
  function getEscrowHistory(address _buyer) external view virtual returns (escrowInfo [] memory) {
    return escrowList[_buyer];
  }

  /** 
     * @dev Get status of a particular redemption process
     *
     * @param _buyer       The address of the buyer
     * @param _id          The cached id of the escrow, retrieved from database
     * @return             The current status
  */
  function getRedeemStatus(address _buyer, uint256 _id) external view virtual returns (escrowState) {
    require(_id >=  0 || _id < escrowList[_buyer].length, "Invalid id");
    return escrowList[_buyer][_id].state;
  }

}
