const Dex = artifacts.require("DEX.sol");

module.exports = async function (deployer, network, addresses) {
  await deployer.deploy(Dex, addresses[0]);
  const dex = await Dex.deployed();

  await dex.init(10*10**18);
};
   