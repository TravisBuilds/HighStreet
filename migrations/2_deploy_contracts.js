const Dex = artifacts.require("DEX");
const Token = artifacts.require("ProductToken");

module.exports = async function (deployer, network) {
	let tokenAddress;
	if (network === "mainnet") {
		tokenAddress = "";
	} else {
		await deployer.deploy(Token, 330000, 500, web3.utils.toWei('0.33', 'ether'));			// initialize reserve ratio for the token in ppm, stand in for testing.
		const token = await Token.deployed();
		tokenAddress = token.address;
	}
  await deployer.deploy(Dex, tokenAddress);
  const dex = await Dex.deployed();
};
