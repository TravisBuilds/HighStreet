const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
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

contract('escrow flow check', function (accounts) {
    /*
     * boinding curve basic parameters
    */
	const exp = '330000';
	const max = '500';
	const offset = '10';
	const baseReserve = web3.utils.toWei('0.33', 'ether');

    /* GLOBAL PARAMETERS*/
    const DEG = true;
    const DaiEtherRaio = 1;
    const HsTokenEtherRatio = 1;

    const STATE_AWAITING_PROCESSING = 1;
    const STATE_COMPLETE_USER_REFUND = 2;
    const STATE_COMPLETE = 3;

    const numberToBigNumber = (val) => web3.utils.toWei(val.toString(), 'ether');
    const bigNumberToNumber = (val) => web3.utils.fromWei(val.toString(), 'ether');
    const printEscrowList = async (list) => await list.reduce( async (_prev, val, index) => {
          const ESCROW_STATE = ['INITIAL', 'AWAITING_PROCESSING', 'COMPLETE_USER_REFUND', 'COMPLETE'];
          const state = ESCROW_STATE[val[0]];
          const amount = val[1];
          const value = val[2];
          console.log('index:', index, 'state:', state, 'amount:', amount, 'value:',  bigNumberToNumber(value));
          return Promise.resolve("DO_NOT_CALL");
        },0);

  beforeEach('deploy implementation', async function () {
    this.owner = accounts[0];
    this.user1 = accounts[1];
    this.user2 = accounts[2];
    this.factoryImpl = await TokenFactory.new({from: this.owner});
    this.implementationV0 = await ProductToken.new();
    this.implementationV1 = await ProductTokenV1.new();
    this.bondingCurveImpl = await BondingCurve.new();
    this.HighMock = await DaiMock.new();
    this.DaiEtherMock = await ChainLinkMock.new(numberToBigNumber(DaiEtherRaio), {from: this.owner});
    this.HsTokenEtherMock = await ChainLinkMock.new(numberToBigNumber(HsTokenEtherRatio), {from: this.owner});

    // initial tokenfactory
    const beacon = await UpgradeableBeacon.new(this.implementationV1.address, {from: this.owner});
    const data = await this.factoryImpl.contract.methods.initialize(beacon.address).encodeABI();
    const { address } = await ERC1967Proxy.new(this.factoryImpl.address, data, {from: this.owner});
    this.tokenFactory = await TokenFactory.at(address);
    this.tokenFactory.UpdateBeacon(beacon.address, {from: this.owner});

    // create HighGO token
    const data1 = this.implementationV1.contract
              .methods.initialize('HighGO', 'HG', this.bondingCurveImpl.address, exp, max, offset, baseReserve).encodeABI();
    await this.tokenFactory.createToken(
      "HighGO", data1, {from: this.owner}
    );

    // get HighGO token address
    const highGoAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    this.highGo = new ProductTokenV1(highGoAddress);
    await this.highGo.setHigh(this.HighMock.address, {from: this.owner});
    await this.highGo.launch({from: this.owner});
  });

  it('tradein should success', async function (){
    const redeemNumber = 3;
    let {HighMock, highGo, user1} = this;

    await HighMock.faucet(user1, numberToBigNumber(1000));

    for(let i=0 ; i<5; i++) {
      let price = await highGo.getCurrentPrice();
      if(DEG) console.log(i, ': current highGo price(HIGH)', bigNumberToNumber(price));
      await HighMock.approve(highGo.address, price, {from: user1});
      await highGo.buy(price, {from: user1});
    }

    // get sell return before user starting tradin
    let redeemTokenValue = await highGo.calculateSellReturn(redeemNumber);
    console.log('redeemTokenValue', bigNumberToNumber(redeemTokenValue));

    // user tradin
    let tradeinCountBefore = await highGo.tradeinCount();
    let balanceBefore = await highGo.balanceOf(user1);
    if(DEG) console.log('user1 owner amount of token before tradein:', balanceBefore.toString());
    await highGo.tradein(redeemNumber, {from: user1});
    let balanceAfter = await highGo.balanceOf(user1);
    if(DEG) console.log('user1 owner amount of token after tradein:', balanceAfter.toString());

    assert.equal(tradeinCountBefore.toString(), 0, "initial amount should be zero");
    assert.equal(balanceAfter, balanceBefore - redeemNumber,  "amount should be as same as amount of user tradein");

    let list = await highGo.getEscrowHistory(user1);
    assert.equal(list.length, 1, "user1 only redeem once");

    let trans = list[0];
    console.log('trans.value', bigNumberToNumber(trans.value));
    assert.equal(trans.state, STATE_AWAITING_PROCESSING, "escrow initial state should be STATE_AWAITING_PROCESSING");
    assert.equal(trans.amount, redeemNumber);
    assert.equal(redeemTokenValue
           , trans.value
           , "the redeem value must be same ");
  });

  it('check escrow state update', async function (){
    const redeemNumber = 1;
    let {HighMock, highGo, user1, owner} = this;

    await HighMock.faucet(user1, numberToBigNumber(1000));

    let price = await highGo.getCurrentPrice();
    await HighMock.approve(highGo.address, price, {from: user1});
    await highGo.buy(price, {from: user1});

    await highGo.tradein(redeemNumber, {from: user1});

    let transId = 0;
    let trans = (await highGo.getEscrowHistory(user1))[transId];
    assert.equal(trans.state, STATE_AWAITING_PROCESSING, "escrow initial state should be STATE_AWAITING_PROCESSING");

    //update escrow state by owner
    await highGo.updateUserCompleted(user1, transId, {from: owner});
    trans = (await highGo.getEscrowHistory(user1))[transId];
    assert.equal(trans.state, STATE_COMPLETE, "escrow state should be STATE_COMPLETE after ower update to complete");
  });

  it('check tradein refund', async function (){
    const redeemNumber = 1;
    let {HighMock, highGo, user1, owner} = this;

    await HighMock.faucet(user1, numberToBigNumber(1000));

    let price = await highGo.getCurrentPrice();
    await HighMock.approve(highGo.address, price, {from: user1});
    await highGo.buy(price, {from: user1});

    await highGo.tradein(redeemNumber, {from: user1});

    let transId = 0;
    let trans = (await highGo.getEscrowHistory(user1))[transId];
    assert.equal(trans.state, STATE_AWAITING_PROCESSING);

    //update escrow state to refund by owner
    const balanceBeforeRefund = await HighMock.balanceOf(user1, {from: user1});
    await highGo.updateUserRefund(user1, transId, {from: owner});
    const balanceAfterRefund = await HighMock.balanceOf(user1, {from: user1});

    trans = (await highGo.getEscrowHistory(user1))[transId];
    assert.equal(trans.state, STATE_COMPLETE_USER_REFUND, "escrow state should be STATE_COMPLETE_USER_REFUND");

    // calculate the user balance after user get the refund
    const refund = (new BN(balanceAfterRefund)).sub(new BN(balanceBeforeRefund));

    assert.equal(refund.toString()
          , (new BN(trans.value)).toString()
          , "the increasing of user balance should as same as the the escrow value");
  });

})
