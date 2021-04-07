const Dex = artifacts.require("DEX.sol");
const Token = artifacts.require("ProductToken.sol");

module.exports = async function (deployer, network) {
	let tokenAddress;
	if (network === "mainnet") {
		tokenAddress = "";
	} else {
		await deployer.deploy(Token, 330000, 500);			// initialize reserve ratio for the token in ppm, stand in for testing.
		const token = await Token.deployed();
		tokenAddress = token.address;
	}
  await deployer.deploy(Dex, tokenAddress);
  const dex = await Dex.deployed();
};
