const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
// const Web3EthAbi = require('web3-eth-abi');

const TokenFactory = artifacts.require('TokenFactory');
const ProductToken = artifacts.require('ProductToken');
const ProductTokenV1 = artifacts.require('ProductTokenV1'); 
const ProductTokenV2 = artifacts.require('ProductTokenV2');
const ProductTokenV3 = artifacts.require('ProductTokenV3');
const ProductTokenV4 = artifacts.require('ProductTokenV4');
const ProductTokenV5 = artifacts.require('ProductTokenV5');
const DaiMock = artifacts.require('DaiMock');
const ProductTokenDestroy = artifacts.require('ProductTokenDestroy');
const UpgradeableBeacon = artifacts.require('ProductUpgradeableBeacon');


require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bn')(BN))
	.should()
// const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

contract('ProductBeaconProxy', function (accounts) {
	const exp = '330000';				// assuming price function exponential factor of 2, input reserve ratio in ppm
	const max = '500';						// assuming max 500 token will be minted
	const offset = '10';
	const baseReserve = web3.utils.toWei('0.33', 'ether');
  let daiMock;
  let chainlinkAddress; 

  before('deploy implementation', async function () {
    this.implementationV0 = await ProductToken.new();
    this.implementationV1 = await ProductTokenV1.new();
    this.implementationV2 = await ProductTokenV2.new();
    this.implementationV3 = await ProductTokenV3.new();
    this.implementationV4 = await ProductTokenV4.new();
    this.implementationV5 = await ProductTokenV5.new();
    this.implementationDestroy = await ProductTokenDestroy.new();
    daiMock = await DaiMock.new();      // dummy
    chainlinkAddress = accounts[4];     // dummy
  });
  
  beforeEach(async function () {
    // Initialize a beacon
    this.beacon = await UpgradeableBeacon.new(this.implementationV0.address);
    this.tokenFactory = await TokenFactory.new(this.beacon.address);
  });

  it ('Token factory should point the right beacon address', async function () {
    const beaconAddress = await this.tokenFactory.beacon();
    expect(beaconAddress).to.equal(this.beacon.address);
  });

  it('Initialize product token', async function () {
      const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createToken(
        "HighGO", data,
      );
      const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
      const dummy = new ProductToken(proxyAddress);

      // this.proxy = await BeaconProxy.new(this.beacon.address, data);
      // const dummy = new ProductToken(this.proxy.address);
      const reserveRatio = await dummy.reserveRatio.call();
      const maxTokenCount = await dummy.maxTokenCount.call();
      // const supplyOffset = await dummy.supplyOffset.call();

      assert.equal(exp, reserveRatio);
      assert.equal(max, maxTokenCount);
      // assert.equal(offset, supplyOffset);
  });

  it('Beacon Update With New Variables', async function(){
    const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createToken(
        "HighGO", data,
      );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    // console.log(proxyAddress);
    const dummy = new ProductToken(proxyAddress);

    this.beacon.upgradeTo(this.implementationV1.address);
    const dummy2 = new ProductTokenV1(proxyAddress);
    dummy2.initialize(exp, '100', offset, baseReserve, daiMock.address, chainlinkAddress);

  });

  // it('Pricing Functions  update',async function(){
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(proxyAddress);
  //   const costV1 = await highGoV1.getPriceForN.call("1")
		// // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   const highGoV2 = new ProductTokenV2(proxyAddress);
  //   const costV2 = await highGoV2.getPriceForN.call("1")
		// costV1.should.be.a.bignumber.that.not.equals(costV2)
  // });

  // it('mulit Token Pricing Functions  update',async function(){
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   let exp_2 = '440000';				// assuming price function exponential factor of 2, input reserve ratio in ppm
	 //  let max_2 = '1000';						// assuming max 500 token will be minted
	 //  let offset_2 = '20';
  //   let baseReserve_2 = web3.utils.toWei('1.44', 'ether');
  //   const data_2 = this.implementationV0.contract.methods.initialize('SuperMax', 'SM', exp_2, max_2, offset_2, baseReserve_2).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "SuperMax", data_2,
  //     );
  //   const highGoProxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   const superMaxProxyAddress = await this.tokenFactory.retrieveToken.call("SuperMax");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(highGoProxyAddress);
  //   const superGov1 = new ProductToken(superMaxProxyAddress);
		// // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   const highGoV2 = new ProductTokenV2(highGoProxyAddress);
  //   const superGoV2 = new ProductTokenV2(superMaxProxyAddress);
  //   const costHighGoV2 = await highGoV2.getPriceForN.call("1")
  //   const costSuperMaxV2 = await superGoV2.getPriceForN.call("1")
		// costHighGoV2.should.be.a.bignumber.that.not.equals(costSuperMaxV2)
  // });

  // it('Availability  Functions  update',async function(){
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(proxyAddress);
  //   const totalSupplyV1 = await highGoV1.getAvailability()
		// // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   const highGoV2 = new ProductTokenV2(proxyAddress);
  //   const totalSupplyV2 = await highGoV2.getAvailability()
		// totalSupplyV1.should.be.a.bignumber.that.not.equals(totalSupplyV2)
  // });

  // it('Skip V2 version  rollback calculateSaleReturn  Functions  update',async function(){
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(proxyAddress);   
  //   const V1 = await highGoV1.calculateSaleReturn(offset,baseReserve,exp,1)
		// // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   this.beacon.upgradeTo(this.implementationV2.address);
  //   this.beacon.upgradeTo(this.implementationV3.address);
  //   // const highGoV3 = new ProductTokenV2(proxyAddress);
  //   const V3 = await highGoV1.calculateSaleReturn(offset,baseReserve,exp,1)
		// V1.should.be.a.bignumber.that.equals(V3)
  // });

  // it('Destroy ProductToken is not succeed', async function(){
		// // console.log(cost1.toString())
    
  //   // console.log(proxyAddress);
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   const highGoV1 = new ProductToken(proxyAddress);   
    
  //   const costV1 = await highGoV1.getPriceForN("1")
  //   this.beacon.upgradeTo(this.implementationDestroy.address);
  //   const costV2 = await highGoV1.getPriceForN("1")
		// costV1.should.be.a.bignumber.that.equals(costV2)
  // });

  // it('update new initialize by implementationV4 ',async function(){   
  //   this.beacon.upgradeTo(this.implementationV4.address);
  //   // console.log(proxyAddress);
  //   let newInitValue = '1000';
  //   const dataV5 = this.implementationV4.contract.methods.initializeV5('HighGO', 'HG', exp, max, offset, baseReserve,newInitValue).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", dataV5,
  //     );
  //     const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   const highGoV5 = new ProductTokenV5(proxyAddress);  
  //   const costV5 = await highGoV5.getNewInitValue()
  //   // console.log(costV5)
		// costV5.should.be.a.bignumber.that.equals(newInitValue)
  // });
});
