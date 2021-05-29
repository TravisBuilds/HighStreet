const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
// const Web3EthAbi = require('web3-eth-abi');
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should()

const TokenProxyFactory = artifacts.require('TokenProxyFactory');
const ProductToken = artifacts.require('ProductToken');
const ProductTokenV2 = artifacts.require('ProductTokenV2');
const ProductTokenV3 = artifacts.require('ProductTokenV3');
const BeaconProxy = artifacts.require('BeaconProxy');
const UpgradeableBeacon = artifacts.require('ProductUpgradeableBeacon');
// const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

contract('ProductBeaconProxy', function (accounts) {
	const exp = '330000';				// assuming price function exponential factor of 2, input reserve ratio in ppm
	const max = '500';						// assuming max 500 token will be minted
	const offset = '10';
	const baseReserve = web3.utils.toWei('0.33', 'ether');

  before('deploy implementation', async function () {
    this.implementationV0 = await ProductToken.new();
    // console.log((await this.implementationV0.reserveRatio()).toString());
    this.implementationV1 = await ProductTokenV2.new();
    this.implementationV2 = await ProductTokenV3.new();
  });
  
  beforeEach(async function () {
    // Initialize a beacon
    this.beacon = await UpgradeableBeacon.new(this.implementationV0.address);
    this.tokenFactory = await TokenProxyFactory.new(this.beacon.address);
  });

  xit ('Token factory should point the right beacon address', async function () {
    const beaconAddress = await this.tokenFactory.beacon();
    expect(beaconAddress).to.equal(this.beacon.address);
  });

  xit('Initialize product token', async function () {
      const data = this.implementationV0.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createTokenProxy(
        "HighGO", data,
      );
      const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
      console.log(proxyAddress);
      const dummy = new ProductToken(proxyAddress);

      // this.proxy = await BeaconProxy.new(this.beacon.address, data);
      // const dummy = new ProductToken(this.proxy.address);
      const reserveRatio = await dummy.reserveRatio.call();
      const maxTokenCount = await dummy.maxTokenCount.call();
      const supplyOffset = await dummy.supplyOffset.call();

      assert.equal(exp, reserveRatio);
      assert.equal(max, maxTokenCount);
      assert.equal(offset, supplyOffset);
  });

  it('Beacon Update With New Variables', async function(){
    const data = this.implementationV0.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createTokenProxy(
        "HighGO", data,
      );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    // console.log(proxyAddress);
    const dummy = new ProductToken(proxyAddress);

    await this.beacon.upgradeTo(this.implementationV1.address);

    const dummy2 = new ProductTokenV2(proxyAddress);
    // console.log(await dummy2.getNewAttribute());
    const reserveRatio = await dummy2.reserveRatio.call();
    const maxTokenCount = await dummy2.maxTokenCount.call();
    const supplyOffset = await dummy2.supplyOffset.call();

    assert.equal(exp, reserveRatio);
    assert.equal(max, maxTokenCount);
    assert.equal(offset, supplyOffset);
    
    expect(await dummy2.getNewAttribute()).to.bignumber.eq('1');

  });

  it('Override Existing Functions',async function(){
    const data = this.implementationV0.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createTokenProxy(
        "HighGO", data,
      );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    // console.log(proxyAddress);
    const highGoV1 = new ProductToken(proxyAddress);
    const costV1 = await highGoV1.getPriceForN.call("1");
    console.log(costV1.toString());
    await this.beacon.upgradeTo(this.implementationV1.address);
    // const highGoV2 = new ProductTokenV2(proxyAddress);
    // const costV2 = await highGoV2.getPriceForN.call("1");
    const costV2 = await highGoV1.getPriceForN.call("1");
    console.log(costV2.toString());
    costV1.should.be.a.bignumber.that.not.equals(costV2);
  });

  // it('mulit Token Pricing Functions update',async function(){ 
  //   const data = this.implementationV0.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createTokenProxy(
  //       "HighGO", data,
  //     );
  //   let exp_2 = '440000';       // assuming price function exponential factor of 2, input reserve ratio in ppm
  //   let max_2 = '1000';           // assuming max 500 token will be minted
  //   let offset_2 = '20';
  //   let baseReserve_2 = web3.utils.toWei('1.44', 'ether');
  //   const data_2 = this.implementationV0.contract.methods.initialize(exp_2, max_2, offset_2, baseReserve_2).encodeABI();
  //     await this.tokenFactory.createTokenProxy(
  //       "SuperMax", data_2,
  //     );
  //   const highGoProxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   const superMaxProxyAddress = await this.tokenFactory.retrieveToken.call("SuperMax");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(highGoProxyAddress);
  //   const superGov1 = new ProductToken(superMaxProxyAddress);
  //   // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   const highGoV2 = new ProductTokenV2(highGoProxyAddress);
  //   const superGoV2 = new ProductTokenV2(superMaxProxyAddress);
  //   const costHighGoV2 = await highGoV2.getPriceForN.call("1")
  //   const costSuperMaxV2 = await superGoV2.getPriceForN.call("1")
  //   costHighGoV2.should.be.a.bignumber.that.not.equals(costSuperMaxV2)

  // });

  // it('Availability Functions update',async function(){
  //   const data = this.implementationV0.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createTokenProxy(
  //       "HighGO", data,
  //     );
  //   const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(proxyAddress);
  //   const totalSupplyV1 = await highGoV1.getAvailability()
  //   // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   const highGoV2 = new ProductTokenV2(proxyAddress);
  //   const totalSupplyV2 = await highGoV2.getAvailability()
  //   totalSupplyV1.should.be.a.bignumber.that.not.equals(totalSupplyV2)
  // });

  it('BancorBondingCurve calculateSaleReturn Functions update',async function(){
    const data = this.implementationV0.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createTokenProxy(
        "HighGO", data,
      );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    // console.log(proxyAddress);
    const highGoV1 = new ProductToken(proxyAddress);   
    const V1 = await highGoV1.calculateSaleReturn(offset,baseReserve,exp,1);
    // console.log(cost1.toString())
    // this.beacon.upgradeTo(this.implementationV1.address);
    this.beacon.upgradeTo(this.implementationV2.address);
    const highGoV3 = new ProductTokenV2(proxyAddress);
    const V3 = await highGoV3.calculateSaleReturn(offset,baseReserve,exp,1);
    V3.should.be.a.bignumber.that.equals('0');
  });

}); 