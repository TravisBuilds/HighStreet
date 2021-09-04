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
    const numberToBigNumber = (val) => web3.utils.toWei(val.toString(), 'ether');
    const bigNumberToNumber = (val) => web3.utils.fromWei(val.toString(), 'ether');
    const DaiEtherRatio = numberToBigNumber(0.0003223554);
    const HsTokenEtherRatio = numberToBigNumber(0.5);

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
        this.DaiEtherMock = await ChainLinkMock.new(DaiEtherRatio, {from: this.owner});
        this.HsTokenMock = await DaiMock.new();
        this.HsTokenEtherMock = await ChainLinkMock.new(HsTokenEtherRatio, {from: this.owner});
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

        let price = await highGo.getCurrentPrice();
        await daiMock.approve(highGo.address, price, {from: user1});

        await expectRevert(
            highGo.buyWithDai(price, {from: user1})
            , "unable to trade now"
        );

        price = (new BN(price)).mul(new BN(DaiEtherRatio));
        await expectRevert(
            highGo.buy({from: user1, value:price})
            , "unable to trade now"
        );

        price = (new BN(price)).mul(new BN(DaiEtherRatio)).div(new BN(HsTokenEtherRatio));
        await expectRevert(
            highGo.buyWithHsToken(price, {from: user1})
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

        let price = await highGo.getCurrentPrice();
        await daiMock.approve(highGo.address, price, {from: user1});

        // getAvailability
        let amount = (await highGo.getAvailability()).toString();
        assert.equal(amount, max, "available amout of product token should equal to default value before any trade be made");

        await highGo.buyWithDai(price, {from: user1})
        assert.equal(await highGo.balanceOf(user1), 1, "should able to buy one product token");

        // getAvailability
        amount = (await highGo.getAvailability()).toString();
        assert.equal(amount, max - 1, "currenlty available token should equal to default value minus token had been sold");


        // getCurrentPrice
        assert(bigNumberToNumber(await highGo.getCurrentPrice()) > 0 );

        // getPriceForN
        assert(bigNumberToNumber(await highGo.getPriceForN(1)) > 0 );

        // calculateSellReturn
        assert(bigNumberToNumber(await highGo.calculateSellReturn(1)) > 0 );

        // getLatestDaiEthPrice
        assert.equal(await highGo.getLatestDaiEthPrice(),  DaiEtherRatio);

        // getLatestHsTokenEthPrice
        assert.equal(await highGo.getLatestHsTokenEthPrice(),  HsTokenEtherRatio);
    });

    it('should not able to trade if temp pause product token', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        highGo.launch({from: owner});

        let price = await highGo.getCurrentPrice();
        await daiMock.approve(highGo.address, price, {from: user1});
        await highGo.buyWithDai(price, {from: user1})
        assert.equal(await highGo.balanceOf(user1), 1, "user should able to buy token before is been paused");

        // paused product token
        highGo.pause({from: owner});

        await expectRevert(
            highGo.buyWithDai(price, {from: user1})
            , "unable to trade now"
        );

        price = (new BN(price)).mul(new BN(DaiEtherRatio));
        await expectRevert(
            highGo.buy({from: user1, value: price})
            , "unable to trade now"
        );

        price = (new BN(price)).mul(new BN(DaiEtherRatio)).div(new BN(HsTokenEtherRatio));
        await expectRevert(
            highGo.buyWithHsToken(price, {from: user1})
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

    it('should be success by using dai' , async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        highGo.launch({from: owner});

        let price = await highGo.getCurrentPrice();
        await daiMock.approve(highGo.address, price, {from: user1});

        await highGo.buyWithDai(price, {from: user1})
        assert.equal(await highGo.balanceOf(user1), 1);
    });

    it('should be success by using ether', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        highGo.launch({from: owner});

        let price = await highGo.getCurrentPriceOnEther();
        // add 0.1% for prevent Exchange loss
        price = (new BN(price)).mul(new BN(1001)).div(new BN(1000));

        await highGo.buy({from: user1, value: price})
        assert.equal(await highGo.balanceOf(user1), 1);
    });

    it('should be success by using HsToken', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        highGo.launch({from: owner});

        let price = await highGo.getCurrentPriceOnHsToken();
        // add 0.1% for prevent Exchange loss
        price = (new BN(price)).mul(new BN(1001)).div(new BN(1000));
        await HsTokenMock.approve(highGo.address, price, {from: user1});

        await highGo.buyWithHsToken(price, {from: user1})
        assert.equal(await highGo.balanceOf(user1), 1);
    });

    it('Supplier', async function (){
        let { highGo, daiMock, HsTokenMock, user1, owner, supplier} =this;

        await daiMock.faucet(user1, numberToBigNumber(1000));
        await HsTokenMock.faucet(user1, numberToBigNumber(1000));

        highGo.launch({from: owner});

        // setSupplierWallet
        await highGo.setSupplierWallet(supplier, {from: owner});

        let supplierDai = new BN(0);

        for(let i=0 ; i< 5; i++) {
            let price = await highGo.getCurrentPrice();
            if(DEG) console.log(i, ': current product price(DAI)', bigNumberToNumber(price));
            await daiMock.approve(highGo.address, price, {from: user1});
            await highGo.buyWithDai(price, {from: user1});
            // 1% for supplier fee
            let supplierFeeRate = (new BN(price)).mul(new BN(1)).div(new BN(100));
            if(DEG) console.log(i, ': supplierFeeRate', bigNumberToNumber(supplierFeeRate));
            supplierDai = supplierDai.add(supplierFeeRate);
        }

        let balance = await highGo.getSupplierDaiBalance();
        assert.equal(supplierDai.toString(), balance.toString());

        let amountOfSell = 2;
        // sellReturn already contain 2% platform fee
        let sellReturn = await highGo.calculateSellReturn(amountOfSell);
        // origin value = sellReturn / 0.98
        sellReturn = (new BN(sellReturn)).mul(new BN(numberToBigNumber(100))).div(new BN(numberToBigNumber(98)))
        // 1% for supplier fee
        sellReturn = sellReturn.mul(new BN(1)).div(new BN(100));
        supplierDai = supplierDai.add(sellReturn);
        await highGo.sell(amountOfSell, {from: user1});

        balance = await highGo.getSupplierDaiBalance();
        assert.equal(supplierDai.toString(), balance.toString());

        // claimSupplierDai
        let claimValue = (new BN(balance)).mul(new BN(50)).div(new BN(100));
        let remainValue = (new BN(balance)).sub(claimValue);
        await highGo.claimSupplierDai(claimValue, {from: supplier});
        let balanceAfter = await highGo.getSupplierDaiBalance();
        assert.equal(remainValue.toString(), balanceAfter.toString(), "remain supplier dai should be right");

    });

})