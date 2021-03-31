pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BancorBondingCurve.sol";

contract LumiToken is ERC20, Ownable, BancorBondingCurve {
	using SafeMath for uint256;

	event Minted(address sender, uint amount, uint deposit);
  event Burned(address sender, uint amount, uint refund);

	uint256 public scale = 10**18;
  uint256 public reserveBalance = 10*scale;		// amount in ether or dai
  uint256 public reserveRatio;

	/**
   * @dev Constructor
   *
   * @param _reserveRatio              the reserved ratio in ppm
  */
  constructor(uint256 _reserveRatio) ERC20("LumiToken", "") public {		
    reserveRatio = _reserveRatio;		// initialize the reserve ratio for this token.
    _mint(msg.sender, 1*scale);
  }

  function mint() public payable {
    require(msg.value > 0, "Must send ether to buy tokens.");
    _discreteMint(msg.value);
  }

 	function sale(uint256 _amount) public {
    uint256 returnAmount = _discreteSale(_amount);
    msg.sender.transfer(returnAmount);
  }

  // need a burn function here.

  // function () public payable { mint(); }

  function calculateBuyReturn(uint256 _amount)
    public view returns (uint256 mintAmount)
  {
    return calculatePurchaseReturn(totalSupply(), reserveBalance, uint32(reserveRatio), _amount);
  }

  function calculateSellReturn(uint256 _amount)
    public view returns (uint256 burnAmount)
  {
    return calculateSaleReturn(totalSupply(), reserveBalance, uint32(reserveRatio), _amount);
  }

  function _discreteMint(uint256 _deposit)
    internal returns (uint256)
  {
    require(_deposit > 0, "Deposit must be non-zero.");

    uint256 amount = calculateBuyReturn(_deposit);
    // have to make it discrete here.

    _mint(msg.sender, amount);
    reserveBalance = reserveBalance.add(_deposit);
    emit Minted(msg.sender, amount, _deposit);
    return amount;
  }

  // have to add a function about redeeming token
  function _discreteSale(uint256 _amount)
    internal returns (uint256)
  {
  	// uint256 reimburseAmount = calculateSellReturn(_amount);
 		// reserveBalance = reserveBalance.sub(reimburseAmount);

  }

  // have to change return types, since burning a product token have a different set of logics.
  function _discreteBurn(uint256 _amount)
    internal
  {
    require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to burn.");

    // uint256 reimburseAmount = calculateSellReturn(_amount);
    // reserveBalance = reserveBalance.sub(reimburseAmount);
    // have to change burn function here
    _burn(msg.sender, _amount);
    // emit Burned(msg.sender, _amount, reimburseAmount);
    // return reimburseAmount;
  }
}
