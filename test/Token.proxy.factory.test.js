const TokenProxyFactory = artifacts.require('TokenProxyFactory');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const ProductToken = artifacts.require('ProductToken');
const encodeCall = require('@openzeppelin/upgrades');
const truffleAssert = require('truffle-assertions');

contract('TokenProxyFactory', function (accounts) {
	const exp = 330000				// assuming price function exponential factor of 2, input reserve ratio in ppm
	const max = 500						// assuming max 500 token will be minted
	const offset = 10
	const baseReserve = web3.utils.toWei('0.33', 'ether')
	let imp
  let proxyFactory
  beforeEach(async function () {
    // initialize(string memory _name, string memory _symbol, uint32 _reserveRatio, uint32 _maxTokenCount, uint32 _supplyOffset, uint256 _baseReserve)
    imp  = await deployProxy(ProductToken, ['HighGO)','HG',exp, max, offset, baseReserve], {initializer: 'initialize'});
    proxyFactory = await TokenProxyFactory.new(imp.address);
  });
  xit('checks event for when a new type of token is created', async function () {
    
    truffleAssert.prettyPrintEmittedEvents(proxyFactory); 
  });
  
  xit('it should return logicContract', async function () {
   const address = await proxyFactory.address;
   console.log(address);
   console.log(imp.address);
   assert.equal(address, imp.address);
  });
  xit('it should createTokenProxy ', async function () {
    // initializeData = encodeCall(
    //   'initialize', 
    //   ['uint32', 'uint32','uint32','uint256'],   
    //   [exp, max,offset,baseReserve]
    // );
   
    // const proxyAddress = await     
    // proxyFactory.createTokenProxy.call(
    //   "HighGO",initializeData,
    // );
    // const impl = await ProductToken.deployed(proxyAddress);
    // const reserveRatio = await impl.reserveRatio.call();
    // const maxTokenCount =await impl.maxTokenCount.call();
    // const supplyOffset =await impl.supplyOffset.call();
    // assert.equal(exp, reserveRatio);
    // assert.equal(max, maxTokenCount);
    // assert.equal(offset, supplyOffset);
  });
  
});