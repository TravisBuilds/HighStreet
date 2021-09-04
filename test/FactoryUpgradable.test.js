const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
// const Web3EthAbi = require('web3-eth-abi');
const ProductToken = artifacts.require('ProductToken');
const ERC1967Proxy = artifacts.require('ERC1967Proxy');
const TokenFactory = artifacts.require('TokenFactory');
const TokenFactoryV1 = artifacts.require('TokenFactoryV1');
const UpgradeableBeacon = artifacts.require('ProductUpgradeableBeacon');

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bn')(BN))
	.should();

contract('ProductBeaconProxy', function (accounts) {
  before('deploy implementation', async function () {
    this.factoryImp = await TokenFactory.new();
    this.factoryImp2 = await TokenFactoryV1.new();
    this.implementationV0 = await ProductToken.new();
  });
  
  beforeEach(async function () {
    // Initialize a beacon
    this.beacon = await UpgradeableBeacon.new(this.implementationV0.address);

    // this.tokenFactory = await TokenFactory.new(this.beacon.address);
    const data = this.factoryImp.contract.methods.initialize(this.beacon.address).encodeABI();
    const { address } = await ERC1967Proxy.new(this.factoryImp.address, data, {from: accounts[0]});
    this.tokenFactory = await TokenFactory.at(address);
  });

  it('Upgrade factory implementation', async function () {
   	const { receipt } = await this.tokenFactory.upgradeTo(this.factoryImp2.address);
    expect(receipt.logs.filter(({ event }) => event === 'Upgraded').length).to.be.equal(1);
    expectEvent(receipt, 'Upgraded', { implementation: this.factoryImp2.address });
    
    const tokenFactoryV1 = await TokenFactoryV1.at(this.tokenFactory.address);
    // (await tokenFactoryV1.newFunction()).should.be.a.bignumber.that.equals('100');
   	const ret = await tokenFactoryV1.getNewAttribute();
   	console.log(ret.toString());
  });
});