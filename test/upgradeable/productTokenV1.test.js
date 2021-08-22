const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');

const ERC1967Proxy = artifacts.require('ERC1967Proxy');
const TokenFactory = artifacts.require('TokenFactory');
const ProductToken = artifacts.require('ProductToken');
const ProductTokenV1 = artifacts.require('ProductTokenV1');
const DaiMock = artifacts.require('DaiMock');
const BondingCurve = artifacts.require('BancorBondingCurve');
const UpgradeableBeacon = artifacts.require('ProductUpgradeableBeacon');
const ChainLinkMock = artifacts.require('ChainLinkMock');

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bn')(BN))
	.should()

contract('productTokenV1 flow check', function (accounts) {
    /*
     * boinding curve basic parameters
    */
	const exp = '330000';
	const max = '500';
	const offset = '10';
	const baseReserve = web3.utils.toWei('0.33', 'ether');

    /* GLOBAL PARAMETERS*/
    const DEG = false;
    const DaiEtherRaio = 0.0003223554;
    const HsTokenEtherRaio = 0.5;
    const BuytransFee  = 0.05 ;
    const SaletransFee  = 0.02 ;

    const numberToBigNumber = (val) => web3.utils.toWei(val.toString(), 'ether');
    const bigNumberToNumber = (val) => web3.utils.fromWei(val.toString(), 'ether');

    before('deploy implementation', async function () {
        this.owner = accounts[0];
        this.user1 = accounts[1];
        this.user2 = accounts[2];
        this.supplier = accounts[3];
        this.factoryImpl = await TokenFactory.new({from: this.owner});
        this.implementationV0 = await ProductToken.new();
        this.implementationV1 = await ProductTokenV1.new();
        this.bondingCurveImpl = await BondingCurve.new();
        this.daiMock = await DaiMock.new();
        this.DaiEtherMock = await ChainLinkMock.new(numberToBigNumber(DaiEtherRaio), {from: this.owner});
        this.HsTokenMock = await DaiMock.new();
        this.HsTokenEtherMock = await ChainLinkMock.new(numberToBigNumber(HsTokenEtherRaio), {from: this.owner});
    });

    beforeEach(async function () {
        // initial tokenfactory
        const beacon = await UpgradeableBeacon.new(this.implementationV1.address, {from: this.owner});
        const data = await this.factoryImpl.contract.methods.initialize(beacon.address).encodeABI();
        const { address } = await ERC1967Proxy.new(this.factoryImpl.address, data, {from: this.owner});
        this.tokenFactory = await TokenFactory.at(address);
        this.tokenFactory.UpdateBeacon(beacon.address, {from: this.owner});

        // create HighGO token
        const data1 = this.implementationV1.contract
                .methods.initialize('HighGO', 'HG', this.bondingCurveImpl.address, exp, max, offset, baseReserve, this.daiMock.address, this.DaiEtherMock.address).encodeABI();
        await this.tokenFactory.createToken(
        "HighGO", data1, {from: this.owner}
        );

        // get HighGO token address
        const highGoAddress = await this.tokenFactory.retrieveToken.call("HighGO");
        this.highGo = new ProductTokenV1(highGoAddress);
        await this.highGo.setupHsToken(this.HsTokenMock.address, this.HsTokenEtherMock.address);
    });

    it('should unable to trade if product have not launch', async function (){

        let { highGo, daiMock, HsTokenMock, user1 } =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        let priceBN = await highGo.getPriceForN(1);
        let price = bigNumberToNumber(priceBN);
        let priceToBuy = Number.parseFloat(price * ( 1 + BuytransFee )).toFixed(18);
        await daiMock.approve(highGo.address, numberToBigNumber(priceToBuy), {from: user1});

        await expectRevert(
            highGo.buyWithDai(numberToBigNumber(priceToBuy), {from: user1})
            , "unable to trade now"
        );

        priceToBuy = Number.parseFloat(price * DaiEtherRaio * (1 + BuytransFee)).toFixed(18);
        await expectRevert(
            highGo.buy({from: user1, value:numberToBigNumber(priceToBuy)})
            , "unable to trade now"
        );

        priceToBuy = Number.parseFloat(price * DaiEtherRaio / HsTokenEtherRaio * (1 + BuytransFee)).toFixed(18);
        await expectRevert(
            highGo.buyWithHsToken(numberToBigNumber(priceToBuy), {from: user1})
            , "unable to trade now"
        );

        await expectRevert(
            highGo.sell(1, {from: user1})
            , "unable to trade now"
        );

        await expectRevert(
            highGo.tradein(1, {from: user1})
            , "unable to trade now"
        );
    });

    it('basic functionality test', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));
        highGo.launch({from: owner});

        let priceBN = await highGo.getPriceForN(1);
        let price = bigNumberToNumber(priceBN);
        let priceToBuy = Number.parseFloat(price * ( 1 + BuytransFee )).toFixed(18);
        await daiMock.approve(highGo.address, numberToBigNumber(priceToBuy), {from: user1});

        // getAvailability
        let amount = (await highGo.getAvailability()).toString();
        assert.equal(amount, max);

        await highGo.buyWithDai(numberToBigNumber(priceToBuy), {from: user1})
        assert.equal(await highGo.balanceOf(user1), 1);

        // getAvailability
        amount = (await highGo.getAvailability()).toString();
        assert.equal(amount, max - 1);


        // getCurrentPrice
        assert(bigNumberToNumber(await highGo.getCurrentPrice()) > 0 );

        // getPriceForN
        assert(bigNumberToNumber(await highGo.getPriceForN(1)) > 0 );

        // calculateSellReturn
        assert(bigNumberToNumber(await highGo.calculateSellReturn(1)) > 0 );

        // getLatestDaiEthPrice
        assert.equal(bigNumberToNumber(await highGo.getLatestDaiEthPrice()),  DaiEtherRaio);

        // getLatestHsTokenEthPrice
        assert.equal(bigNumberToNumber(await highGo.getLatestHsTokenEthPrice()),  HsTokenEtherRaio);
    });


    it('should not able to trade if temp pause product token', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        highGo.launch({from: owner});

        let priceBN = await highGo.getPriceForN(1);
        let price = bigNumberToNumber(priceBN);
        let priceToBuy = Number.parseFloat(price * ( 1 + BuytransFee )).toFixed(18);
        await daiMock.approve(highGo.address, numberToBigNumber(priceToBuy), {from: user1});
        await highGo.buyWithDai(numberToBigNumber(priceToBuy), {from: user1})
        assert.equal(await highGo.balanceOf(user1), 1);

        highGo.pause({from: owner});

        await expectRevert(
            highGo.buyWithDai(numberToBigNumber(priceToBuy), {from: user1})
            , "unable to trade now"
        );
    });

    it('using dai should success' , async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        highGo.launch({from: owner});

        let priceBN = await highGo.getPriceForN(1);
        let price = bigNumberToNumber(priceBN);
        let priceToBuy = Number.parseFloat(price * ( 1 + BuytransFee )).toFixed(18);
        await daiMock.approve(highGo.address, numberToBigNumber(priceToBuy), {from: user1});

        await highGo.buyWithDai(numberToBigNumber(priceToBuy), {from: user1})
        assert.equal(await highGo.balanceOf(user1), 1);
    });

    it('should be success by using ether', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        highGo.launch({from: owner});

        let priceBN = await highGo.getPriceForN(1);
        let price = bigNumberToNumber(priceBN);
        let priceToBuy = Number.parseFloat(price * DaiEtherRaio * (1 + BuytransFee)).toFixed(18);

        await highGo.buy({from: user1, value:numberToBigNumber(priceToBuy)})
        assert.equal(await highGo.balanceOf(user1), 1);
    });

    it('should be success by using HsToken', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        highGo.launch({from: owner});

        let priceBN = await highGo.getPriceForN(1);
        let price = bigNumberToNumber(priceBN);
        let priceToBuy = Number.parseFloat(price * DaiEtherRaio / HsTokenEtherRaio * (1 + BuytransFee)).toFixed(18);
        await HsTokenMock.approve(highGo.address, numberToBigNumber(priceToBuy), {from: user1});

        await highGo.buyWithHsToken(numberToBigNumber(priceToBuy), {from: user1})
        assert.equal(await highGo.balanceOf(user1), 1);
    });

    it('Supplier', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner, supplier} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        highGo.launch({from: owner});

        // setSupplierWallet
        await highGo.setSupplierWallet(supplier, {from: owner});

        let supplierDai = 0;
        const supplierFeeRate = 0.01;

        for(let i=0 ; i< 5; i++) {
            let priceBN = await highGo.getPriceForN(1);
            let price = bigNumberToNumber(priceBN);
            if(DEG) console.log(i, ': current product price(DAI)', price);
            let priceToBuy = Number.parseFloat(price*1.05).toFixed(18);
            await daiMock.approve(highGo.address, numberToBigNumber(priceToBuy), {from: user1});
            await highGo.buyWithDai(web3.utils.toWei(priceToBuy.toString(), 'ether'), {from: user1});
            supplierDai += priceToBuy * supplierFeeRate;
        }

        let balance = await highGo.getSupplierDaiBalance();
        assert.equal(Number.parseFloat(supplierDai).toFixed(10), Number.parseFloat(bigNumberToNumber(balance)).toFixed(10));

        let amountOfSell = 2;
        supplierDai += bigNumberToNumber(await highGo.calculateSellReturn(amountOfSell)) * supplierFeeRate;
        await highGo.sell(amountOfSell, {from: user1});

        balance = await highGo.getSupplierDaiBalance();
        assert.equal(Number.parseFloat(supplierDai).toFixed(10), Number.parseFloat(bigNumberToNumber(balance)).toFixed(10));

        // claimSupplierDai
        await highGo.claimSupplierDai(balance*0.5, {from: supplier});
        let balanceAfter = await highGo.getSupplierDaiBalance();
        assert.equal(Number.parseFloat(bigNumberToNumber(balance*0.5)).toFixed(10), Number.parseFloat(bigNumberToNumber(balanceAfter)).toFixed(10));

    });

})