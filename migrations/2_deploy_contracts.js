const Dex = artifacts.require("DEX.sol");
const Token = artifacts.require("Balloons.sol");

module.exports = async function (deployer) {
	await deployer.deploy(Token);
	const token = await Token.deployed();
	let tokenAddress = token.address;
  await deployer.deploy(Dex, tokenAddress);
  const dex = await Dex.deployed();
};
   