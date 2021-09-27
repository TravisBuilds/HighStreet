const TokenV0 = artifacts.require("ProductTokenV0");
const TokenV1 = artifacts.require("ProductTokenV1");
const Factory = artifacts.require("TokenFactory");
const TokenFactoryProxy = artifacts.require('TokenFactoryProxy');
const BancorBondingCurve = artifacts.require('BancorBondingCurve');
const UpgradeableBeacon = artifacts.require('UpgradeableBeacon');


module.exports = async function (deployer, network, accounts ) {
	let owner = accounts[0];

    let isUpgradeToV1 =false;
    if(isUpgradeToV1) {
		await deployer.deploy(TokenV0, {from:owner, overwrite: false});
		const tokenImplV0 = await TokenV0.deployed();

		await deployer.deploy(UpgradeableBeacon, tokenImplV0.address, {from:owner, overwrite: false});
		const beacon = await UpgradeableBeacon.deployed();

        await deployer.deploy(TokenV1, {from:owner, overwrite: false});
        const tokenImplV1 = await TokenV1.deployed();

        await beacon.upgradeTo(tokenImplV1.address);
    }
}




