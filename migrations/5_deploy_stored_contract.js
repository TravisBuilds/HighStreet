const Stored = artifacts.require("Stored");


module.exports = async function (deployer, network, accounts ) {
    let owner = accounts[0];
    let isDevelop = true;
    let test_address;

    
    if(network == 'rinkeby') {
        console.log('rinkeby');
        isDevelop = false;
        test_address = "0x2d5c87dc53D42B31286955923A2114C7fc967852";
    } else if (network == 'mainnet') {
        console.log('mainnet');
    }
    let isDeployContract = false;

    if(!isDevelop) {
        await deployer.deploy(Stored, test_address, {from:owner, overwrite: true });
        let stored = await Stored.deployed();

        // let voucherCollector = "0xF4D9ee7736729cbe24Ee68E1c02Db1B25efDCa08";
        // await exchanger.updateCollector(voucherCollector);
    }
}




