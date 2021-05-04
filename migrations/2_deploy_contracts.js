const DaiMock = artifacts.require("DaiMock");
const Token = artifacts.require("ProductToken");
// const Factory = artifacts.require("TokenFactory");

module.exports = async function (deployer, network, accounts ) {
	let daiAdress;
	if (network=='mainnet') {
		daiAdress = '';			// fill in the dai address from mainnet
	} else if (network=='rinkeby') {
		daiAdress = '';			// fill in the dai address from rinkeby, if there is any
	} else {
		await deployer.deploy(DaiMock);
		const dai = await DaiMock.deployed();
		await dai.faucet(accounts[0], web3.utils.toWei('100', 'ether'));		// ether here just means 10 ** 18
		daiAdress = dai.address;
	}

	await deployer.deploy(Token, daiAdress, 330000, 500, 3, web3.utils.toWei('9', 'ether'));			// initialize reserve ratio for the token in ppm, stand in for testing.
	const token = await Token.deployed();
	
	// await deployer.deploy(Factory, {from: accounts[0]});
	// const factory = await Factory.deployed();
	// let token = await factory.createToken("Kalon Tea", 330000, 500, 3, web3.utils.toWei('9', 'ether'), {from: accounts[0]});
	// let address = await factory.retrieveToken("Kalon Tea");		// this is how you retrieve token.	

};
