const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Token = artifacts.require("ProductToken");

module.exports = async function (deployer) {
	// let tokenAddress;
	// if (network === "mainnet") {
	// 	tokenAddress = "";
	// } else {
	// 	await deployer.deploy(Token, 330000, 500, 10, web3.utils.toWei('0.33', 'ether'));			// initialize reserve ratio for the token in ppm, stand in for testing.
	// 	const token = await Token.deployed();
	// 	tokenAddress = token.address;
	// }
	const instance = await deployProxy(Token, [330000, 500, 10, web3.utils.toWei('0.33', 'ether')], { deployer });
	console.log('Deployed', instance.address);
};
