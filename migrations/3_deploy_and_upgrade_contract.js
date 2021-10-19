const TokenV1 = artifacts.require("ProductTokenV1");

module.exports = async function (deployer, network, accounts ) {
	let owner = accounts[0];

    let isDeployV1 =false;
    if(isDeployV1) {
        await deployer.deploy(TokenV1, {from:owner, overwrite: false});
    }
}




