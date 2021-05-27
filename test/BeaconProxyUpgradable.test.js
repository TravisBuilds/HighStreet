const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
// const Web3EthAbi = require('web3-eth-abi');

const TokenProxyFactory = artifacts.require('TokenProxyFactory');
const ProductToken = artifacts.require('ProductToken');
const ProductTokenV2 = artifacts.require('ProductTokenV2');
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
  });
  
  beforeEach(async function () {
    // Initialize a beacon
    this.beacon = await UpgradeableBeacon.new(this.implementationV0.address);
    this.tokenFactory = await TokenProxyFactory.new(this.beacon.address);
  });

  it ('Token factory should point the right beacon address', async function () {
    const beaconAddress = await this.tokenFactory.beacon();
    expect(beaconAddress).to.equal(this.beacon.address);
  });

  it('Initialize product token', async function () {
      const data = this.implementationV0.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createTokenProxy(
        "HighGO", data,
      );
      const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
      // console.log(proxyAddress);
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

  it('beacon update',async function(){
    const data = this.implementationV0.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createTokenProxy(
        "HighGO", data,
      );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    // console.log(proxyAddress);
    const dummy = new ProductToken(proxyAddress);

    this.beacon.upgradeTo(this.implementationV1.address);

    const dummy2 = new ProductTokenV2(proxyAddress);
    // console.log(await dummy2.getNewAttribute());
    expect(await dummy2.getNewAttribute.call()).to.bignumber.eq('1');
    // upgradeableBeacon.upgradeTo(impUpgradeable.address)

  });
});