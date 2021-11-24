/* PRODUCT TOKEN */
const TokenV0 = artifacts.require("ProductTokenV0");
const TokenV1 = artifacts.require("ProductTokenV1");
const Factory = artifacts.require("TokenFactory");
const TokenFactoryProxy = artifacts.require('TokenFactoryProxy');
const BancorBondingCurve = artifacts.require('BancorBondingCurve');
const UpgradeableBeacon = artifacts.require('UpgradeableBeacon');


module.exports = async function (deployer, network, accounts ) {
	let owner = accounts[0];

	let isDeployProductToken = true;
	if(isDeployProductToken){

		await deployer.deploy(BancorBondingCurve, {from:owner, overwrite: false});
		const BancorBondingCurveImpl = await BancorBondingCurve.deployed();

		await deployer.deploy(TokenV1, {from:owner, overwrite: false});
		const tokenImplV1 = await TokenV1.deployed();

		await deployer.deploy(UpgradeableBeacon, tokenImplV1.address, {from:owner, overwrite: false});
		const beacon = await UpgradeableBeacon.deployed();

		await deployer.deploy(Factory, {from:owner, overwrite: false});
		const factoyImpl = await Factory.deployed();

		const data = factoyImpl.contract.methods.initialize(beacon.address).encodeABI();
		await deployer.deploy(TokenFactoryProxy, factoyImpl.address, data, {from:owner, overwrite: false});
		const factoyProxy = await TokenFactoryProxy.deployed();
	}
};
