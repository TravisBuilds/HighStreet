pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BancorBondingCurve.sol";

contract LumiToken is ERC20, Ownable, BancorBondingCurve {
	using SafeMath for uint256;

	event Minted(address sender, uint amount, uint deposit);		// event to fire when a new token is minted
  event Traded(address sender, uint amount, uint refund);			// event to fire when a token has been sold back
  event Burned(address sender, uint amount);									// event to fire when a token is redeemed in the real world

	uint256 public scale = 10**18;
  uint256 public reserveBalance = 10*scale;		// amount in ether or dai
  uint256 public reserveRatio;

  uint32 public maxTokenCount;
  uint32 public burnedCount = 0;

  // mapping (address => uint256) ownerTokenCount;

	/**
   * @dev Constructor
   *
   * @param _reserveRatio              the reserved ratio in ppm
   * @param _maxTokenCount						the amount of token that will exist for this type.
  */
  constructor(uint256 _reserveRatio, uint32 _maxTokenCount) ERC20("LumiToken", "") public {		
  	require(_maxTokenCount > 0, "Invalid max token count.");
    reserveRatio = _reserveRatio;		// initialize the reserve ratio for this token.
    maxTokenCount = _maxTokenCount;
    _mint(msg.sender, 1);
  }

  // Functions we provide for our token holders.
  function mint() public payable {
    require(msg.value > 0, "Must send ether to buy tokens.");
    _discreteMint(msg.value);
  }

 	function sale(uint32 _amount) public {
    uint256 returnAmount = _discreteSale(_amount);
    msg.sender.transfer(returnAmount);
  }

  function burn(uint32 _amount) public {
  	_discreteBurn(_amount);
  }

  // function () public payable { mint(); }

  // View Functions for outside.
  function calculateBuyReturn(uint256 _amount)
    public view returns (uint256 mintAmount)
  {
    return calculatePurchaseReturn(totalSupply() + burnedCount, reserveBalance, uint32(reserveRatio), _amount);
  }

  function calculateSellReturn(uint256 _amount)
    public view returns (uint256 burnAmount)
  {
    return calculateSaleReturn(totalSupply() + burnedCount, reserveBalance, uint32(reserveRatio), _amount);
  }

  function calculateTokenPrice() 
  	public view returns	(uint256 price)
  {
  	return calculateUnitPrice(totalSupply() + burnedCount, reserveBalance, uint32(reserveRatio));
  }

  // specific implementations of transaction logics.
  function _discreteMint(uint256 _deposit)
    internal returns (uint256)
  {
  	require(totalSupply() + burnedCount < maxTokenCount, "Sorry, this token is sold out.");
    require(_deposit > 0, "Deposit must be non-zero.");

    uint256 amount = calculateBuyReturn(_deposit);	    // have to make it discrete here. Replace amount with uint32

    _mint(msg.sender, amount);		// have to specifically mint whole numbers
    reserveBalance = reserveBalance.add(_deposit);
    emit Minted(msg.sender, amount, _deposit);
    return amount;
  }

  // have to add a function about redeeming token
  function _discreteSale(uint32 _amount)
    internal returns (uint256)
  {
  	require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to sell.");

  	// uint256 reimburseAmount = calculateSellReturn(_amount);
 		// reserveBalance = reserveBalance.sub(reimburseAmount);

  }

  // have to change return types, since burning a product token have a different set of logics.
  function _discreteBurn(uint32 _amount)
    internal 
  {
    require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to burn.");

    // have to change burn function here
    _burn(msg.sender, _amount);
    // emit Burned(msg.sender, _amount, reimburseAmount);
    burnedCount = burnedCount + _amount;			// Future: use safe math here.
    // return reimburseAmount;
  }
}
