const TokenProxyFactory = artifacts.require('TokenProxyFactory');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const ProductToken = artifacts.require('ProductToken');
const ProductTokenV2 = artifacts.require('ProductTokenV2');
const ProductBeanconProxy = artifacts.require('ProductBeanconProxy');
const ProductUpgradeableBeancon = artifacts.require('ProductUpgradeableBeancon');
const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

contract('ProductBeanconProxy', function (accounts) {
	const exp = 330000				// assuming price function exponential factor of 2, input reserve ratio in ppm
	const max = 500						// assuming max 500 token will be minted
	const offset = 10
	const baseReserve = web3.utils.toWei('0.33', 'ether')
	let imp
   let proxyFactory
    beforeEach(async function () {
        let initializeData = encodeCall(
            'initialize', 
            ['uint32', 'uint32','uint32','uint256'],   
            [exp, max,offset,baseReserve]
          );
        imp  = await deployProxy(ProductToken, [exp, max, offset, baseReserve], {initializer: 'initialize'});
        impUpgradeable = await deployProxy(ProductTokenV2, [exp, max, offset, baseReserve], {initializer: 'initialize'});
        const beancon =  await ProductBeanconProxy.new(imp.address,initializeData)
        const beanconAddress =  await beancon.GetImplementation()
        proxyFactory = await TokenProxyFactory.new(beanconAddress,imp.address);
    });
    it('beancon update',async function(){
      let initializeData = encodeCall(
        'initialize', 
        ['uint32', 'uint32','uint32','uint256'],   
        [exp, max,offset,baseReserve]
      );
      const proxyAddress = await     
      proxyFactory.createTokenProxy.call(
        "HighGO",initializeData,
      );
      const impl = await ProductToken.deployed(proxyAddress);
      const upgradeableBeancon = await ProductUpgradeableBeancon.new(imp.address,initializeData)
      upgradeableBeancon.upgradeTo(impUpgradeable.address)

    })
  });