const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const TokenProxyFactory = artifacts.require('TokenProxyFactory');
const ProductToken = artifacts.require('ProductToken');
const ProductTokenV2 = artifacts.require('ProductTokenV2');
const ProductBeaconProxy = artifacts.require('ProductBeaconProxy');
const ProductUpgradeableBeacon = artifacts.require('ProductUpgradeableBeacon');
// const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

contract('ProductBeaconProxy', function (accounts) {
  const exp = 330000        // assuming price function exponential factor of 2, input reserve ratio in ppm
  const max = 500           // assuming max 500 token will be minted
  const offset = 10
  const baseReserve = web3.utils.toWei('0.33', 'ether')
  let proxyFactory
  let upgradeableBeacon
  beforeEach(async function () {
      // let initializeData = encodeCall(
      //     'initialize', 
      //     ['uint32', 'uint32','uint32','uint256'],   
      //     [exp, max, offset, baseReserve]
      // );
      // this.imp  = await deployProxy(ProductToken, [exp, max, offset, baseReserve], {initializer: 'initialize'});
      this.imp = await ProductToken.new(exp, max, offset, baseReserve, {initializer: 'initialize'});
      // this.impUpgradeable = await deployProxy(ProductTokenV2, [exp, max, offset, baseReserve], {initializer: 'initialize'});
      this.impUpgradeable = await ProductToken.new(exp, max, offset + 1, baseReserve, {initializer: 'initialize'});
      // const beacon =  await ProductBeaconProxy.new(imp.address,initializeData)
      // const beaconAddress =  await beacon.GetImplementation()
      // proxyFactory = await TokenProxyFactory.new(beaconAddress,imp.address);
      proxyFactory = await TokenProxyFactory.new(this.imp.address);
  });

  it('beacon update',async function(){
    let initializeData = this.imp.contract.methods.initialize(exp, max, offset, baseReserve).encodeABI();
    const proxyAddress = await proxyFactory.createTokenProxy(
      "HighGO", initializeData,
    );
    const impl = await ProductToken.deployed(proxyAddress);
    // const upgradeableBeacon = await ProductUpgradeableBeacon.new(imp.address,initializeData)
    const reserveRatio = await impl.reserveRatio.call();
    const maxTokenCount = await impl.maxTokenCount.call();
    const supplyOffset = await impl.supplyOffset.call();
    assert.equal(exp, reserveRatio);
    assert.equal(max, maxTokenCount);
    assert.equal(offset, supplyOffset);

    upgradeableBeacon =  await ProductUpgradeableBeacon.new(impl.address)
    upgradeableBeacon.upgradeTo(this.impUpgradeable.address)
    // const beaconAddress =  await upgradeableBeacon.implementation()

    console.log(await  impl.newAttribute())
    // upgradeableBeacon.upgradeTo(impUpgradeable.address)

  })
});