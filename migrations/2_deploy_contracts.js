
const DaiMock = artifacts.require("DaiMock");
// const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const Token = artifacts.require("ProductToken");
const TokenV1 = artifacts.require("ProductTokenV1");
const Factory = artifacts.require("TokenFactory");
const ERC1967Proxy = artifacts.require('ERC1967Proxy');
// const UUPSUpgradeable = artifacts.require('UUPSUpgradeable');
const UpgradeableBeacon = artifacts.require('UpgradeableBeacon');

module.exports = async function (deployer, network, accounts ) {

	let daiAdress;
	let chainlinkAddress;
	if (network=='mainnet') {
		daiAdress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';			// fill in the dai address from mainnet
		chainlinkAddress = '0x773616E4d11A78F511299002da57A0a94577F1f4';
	} else if (network=='kovan') {
		daiAdress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';			// fill in the dai address from kovan
		chainlinkAddress = '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541';
	} else if (network=='rinkeby') {
		daiAdress = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735';
		chainlinkAddress = '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D';
	} else if (network=='arbitrum') {
		// Note:
		// DAI address on Rinkeby(L1): 0xc7ad46e0b8a400bb3c915120d284aafba8fc4735
		// then the pairing address of L2 is below:
		daiAdress = '0x552444108a2aF6375205f320F196b5D1FEDFaA51';
		// TODO: invalid chainLink Address
		chainlinkAddress = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
	} else {
		await deployer.deploy(DaiMock);
		const dai = await DaiMock.deployed();
		await dai.faucet(accounts[0], web3.utils.toWei('100', 'ether'));		// ether here just means 10 ** 18
		daiAdress = dai.address;
		chainlinkAddress = accounts[1];		// this is placeholder. Chainlink does not have a local network.
	}

	await deployer.deploy(Token);
	const tokenImpl = await Token.deployed();

	await deployer.deploy(TokenV1);
	const tokenImplV1 = await TokenV1.deployed();

	await deployer.deploy(UpgradeableBeacon, tokenImpl.address);
	const beacon = await UpgradeableBeacon.deployed();

	await deployer.deploy(Factory);
	const factoyImpl = await Factory.deployed();

	const data = factoyImpl.contract.methods.initialize(beacon.address).encodeABI();
	await deployer.deploy(ERC1967Proxy,factoyImpl.address, data);
	const factoyProxy = await ERC1967Proxy.deployed();
	const factoryInstance = await Factory.at(factoyProxy.address);

	await beacon.upgradeTo(tokenImplV1.address);

	const exp = '330000';
	const max = '500';
	const offset = '10';
	const baseReserve = web3.utils.toWei('0.33', 'ether');
	const val = tokenImplV1.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve,  daiAdress, chainlinkAddress).encodeABI();

	await factoryInstance.createToken(
		"HighGO", val
	);

	//default launch token directly
	const highGOAddress = await factoryInstance.retrieveToken("HighGO");
	const highGOToken = await TokenV1.at(highGOAddress);
	await highGOToken.launch();
};
