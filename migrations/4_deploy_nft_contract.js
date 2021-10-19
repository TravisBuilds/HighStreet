const Panty = artifacts.require("PANTY");


module.exports = async function (deployer, network, accounts ) {
	let owner = accounts[0];

    let isDeployNFT = true;
    if(isDeployNFT) {
        await deployer.deploy(Panty, {from:owner, overwrite: true});
    }
}




