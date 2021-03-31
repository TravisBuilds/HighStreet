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
    _continuousMint(msg.value);
  }

 	function burn(uint256 _amount) public {
    uint256 returnAmount = _continuousBurn(_amount);
    msg.sender.transfer(returnAmount);
  }

  // function () public payable { mint(); }

  function calculateContinuousMintReturn(uint256 _amount)
    public view returns (uint256 mintAmount)
  {
    return calculatePurchaseReturn(totalSupply(), reserveBalance, uint32(reserveRatio), _amount);
  }

  function calculateContinuousBurnReturn(uint256 _amount)
    public view returns (uint256 burnAmount)
  {
    return calculateSaleReturn(totalSupply(), reserveBalance, uint32(reserveRatio), _amount);
  }

  function _continuousMint(uint256 _deposit)
    internal returns (uint256)
  {
    require(_deposit > 0, "Deposit must be non-zero.");

    uint256 amount = calculateContinuousMintReturn(_deposit);
    _mint(msg.sender, amount);
    reserveBalance = reserveBalance.add(_deposit);
    emit Minted(msg.sender, amount, _deposit);
    return amount;
  }

  function _continuousBurn(uint256 _amount)
    internal returns (uint256)
  {
    require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to burn.");

    uint256 reimburseAmount = calculateContinuousBurnReturn(_amount);
    reserveBalance = reserveBalance.sub(reimburseAmount);
    _burn(msg.sender, _amount);
    emit Burned(msg.sender, _amount, reimburseAmount);
    return reimburseAmount;
  }
}
