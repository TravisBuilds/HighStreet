const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');
// const Web3EthAbi = require('web3-eth-abi');

const ERC1967Proxy = artifacts.require('ERC1967Proxy');
const TokenFactory = artifacts.require('TokenFactory');
const ProductToken = artifacts.require('ProductToken');
const ProductTokenV1 = artifacts.require('ProductTokenV1');
const ProductTokenV2 = artifacts.require('ProductTokenV2');
const ProductTokenV3 = artifacts.require('ProductTokenV3');
const ProductTokenV4 = artifacts.require('ProductTokenV4');
const ProductTokenV5 = artifacts.require('ProductTokenV5');
const DaiMock = artifacts.require('DaiMock');
const ProductTokenDestroy = artifacts.require('ProductTokenDestroy');
const UpgradeableBeacon = artifacts.require('ProductUpgradeableBeacon');
const BeaconProxy = artifacts.require('BeaconProxy');

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bn')(BN))
	.should()
// const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

contract('ProductBeaconProxy', function (accounts) {
	const exp = '330000';				// assuming price function exponential factor of 2, input reserve ratio in ppm
	const max = '500';						// assuming max 500 token will be minted
	const offset = '10';
	const baseReserve = web3.utils.toWei('0.33', 'ether');
  let daiMock;
  let chainlinkAddress; 

  before('deploy implementation', async function () {
    this.factoryImp = await TokenFactory.new({from: accounts[0]});
    this.implementationV0 = await ProductToken.new();
    this.implementationV1 = await ProductTokenV1.new();
    this.implementationV2 = await ProductTokenV2.new();
    this.implementationV3 = await ProductTokenV3.new();
    this.implementationV4 = await ProductTokenV4.new();
    this.implementationV5 = await ProductTokenV5.new();
    this.implementationDestroy = await ProductTokenDestroy.new();
    daiMock = await DaiMock.new();      // dummy
    chainlinkAddress = accounts[4];     // dummy
  });

  beforeEach(async function () {
    // Initialize a beacon
    this.beacon = await UpgradeableBeacon.new(this.implementationV0.address, {from: accounts[0]});
    // this.tokenFactory = await TokenFactory.new(this.beacon.address);
    const data = await this.factoryImp.contract.methods.initialize(this.beacon.address).encodeABI();
    const { address } = await ERC1967Proxy.new(this.factoryImp.address, data, {from: accounts[0]});
    this.tokenFactory = await TokenFactory.at(address);
  });

  it ('Token factory should point the right beacon address', async function () {
    const beaconAddress = await this.tokenFactory.beacon.call();
    expect(beaconAddress).to.equal(this.beacon.address);
  });

  it('Initialize product token', async function () {
      const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createToken(
        "HighGO", data,
      );
      const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
      const dummy = new ProductToken(proxyAddress);

      // this.proxy = await BeaconProxy.new(this.beacon.address, data);
      // const dummy = new ProductToken(this.proxy.address);
      const reserveRatio = await dummy.reserveRatio.call();
      const maxTokenCount = await dummy.maxTokenCount.call();
      // const supplyOffset = await dummy.supplyOffset.call();

      assert.equal(exp, reserveRatio);
      assert.equal(max, maxTokenCount);
      // assert.equal(offset, supplyOffset);
      // dummy.setCreator(accounts[1]);
  });

  it("Beacon Update With New Variables, existing variables shouldn't be overridden", async function(){
    const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
    await this.tokenFactory.createToken(
      "HighGO", data,
    );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    // console.log(proxyAddress);
    const dummy = new ProductToken(proxyAddress);

    await this.beacon.upgradeTo(this.implementationV1.address);
    const dummy2 = new ProductTokenV1(proxyAddress);
    await expectRevert.unspecified(
      dummy2.initialize('HighGO', 'HG', exp, '100', offset, baseReserve, daiMock.address, chainlinkAddress),
    );

    // await expectRevert.unspecified(
    await dummy2.update(daiMock.address, chainlinkAddress);
    // );
    const max2 = await dummy2.maxTokenCount.call();
    // console.log(max2.toString());
    assert.equal(max2, max);
    assert.equal(await dummy2.dai.call(), daiMock.address);

  });

  it("Proxy with newer implemnetation should be able to call initialize function from older implementations", async function(){
    await this.beacon.upgradeTo(this.implementationV1.address);
    console.log(daiMock.address);
    const data = this.implementationV1.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve,  daiMock.address, chainlinkAddress).encodeABI();
      await this.tokenFactory.createToken(
        "HighGO", data,
      );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    const dummy2 = new ProductTokenV1(proxyAddress);

    // assert.equal(max2, max);
    assert.equal(await dummy2.dai.call(), daiMock.address);

    await expectRevert.unspecified(
      dummy2.update(daiMock.address, chainlinkAddress),
    );

  });

  it('Pricing Functions  update',async function(){
    const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
      await this.tokenFactory.createToken(
        "HighGO", data,
      );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    // console.log(proxyAddress);
    const highGoV1 = new ProductToken(proxyAddress);
    const costV1 = await highGoV1.getPriceForN.call("1")
		// console.log(cost1.toString())
    await this.beacon.upgradeTo(this.implementationV1.address);
    await this.beacon.upgradeTo(this.implementationV2.address);
    const highGoV2 = new ProductTokenV2(proxyAddress);
    const costV2 = await highGoV2.getPriceForN.call("1")
		costV1.should.be.a.bignumber.that.not.equals(costV2);
  });

  it('Security check', async function (){
    const DBG = false;
    const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
    await this.tokenFactory.createToken(
      "HighGO", data, {from: accounts[0]}
    );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    const highGoV1 = new ProductToken(proxyAddress);

    await this.beacon.upgradeTo(this.implementationV2.address);

    const highGoV2 = new ProductTokenV2(proxyAddress);

    // 1.the tokenFactory owner should be account[0]
    assert.equal(await this.tokenFactory.owner.call(), accounts[0]);
    // 2.the productToken owner should be tokenFactory
    assert.equal(await highGoV1.owner.call(), this.tokenFactory.address);
    // 3.the creator in productToken should be account[0]
    assert.equal(await highGoV1.creator.call(), accounts[0])
    // 4. the creator of productToken should not be changed after upgrading
    assert.equal(await highGoV2.creator.call(), accounts[0])

    if(DBG) {
      console.log("account[0]:",accounts[0]);
      console.log("account[1]:",accounts[1]);
      console.log("tokenFactory.address:",this.tokenFactory.address);
      console.log("tokenFactory.getOwner:",await this.tokenFactory.getOwner.call());
      console.log("highGoV1.getOwner:",await highGoV1.getOwner.call());
      console.log("highGoV1.creator:",await highGoV1.creator.call());
      console.log("highGoV2.getOwner:",await highGoV2.getOwner.call());
      console.log("highGoV2.creator:",await highGoV2.creator.call());
    }

  })

  it('Redeem flow check', async function (){
    const DEG = true;
    const STATE_INITIAL = 0;
    const STATE_AWAITING_SERVER_CHECK = 1;
    const STATE_AWAITING_DELIVERY = 2;
    const STATE_AWAITING_USER_APPROVAL = 3;
    const STATE_COMPLETE_USER_REFUND = 4;
    const STATE_COMPLETE = 5;
 
    const INDEX_OF_STATE = 0;
    const INDEX_OF_AMOUNT = 1;
    const INDEX_OF_VALUE = 2;
  
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    await daiMock.faucet(user1, web3.utils.toWei('1000', 'ether'));
    await daiMock.faucet(user2, web3.utils.toWei('1000', 'ether'));

    // 1. owner deploy a product
    const beacon = await UpgradeableBeacon.new(this.implementationV1.address, {from: owner});
    this.tokenFactory.UpdateBeacon(beacon.address, {from: owner});
    const data = this.implementationV1.contract
              .methods.initialize('HighGO', 'HG', exp, '100', offset, baseReserve, daiMock.address, chainlinkAddress).encodeABI();
    await this.tokenFactory.createToken(
      "HighGO", data, {from: owner}
    );
    const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
    const highGo = new ProductTokenV1(proxyAddress);
    highGo.launch({from: owner});

    // 2. user1 buy a proudct
    let priceforMaxBuy;
    let price;
    let balance;
    priceforMaxBuy = await highGo.getPriceForN(16);
    price = await highGo.getPriceForN(10);
    await daiMock.approve(proxyAddress, priceforMaxBuy, {from: user1});
    if(DEG) console.log('user1 pay max price', web3.utils.fromWei(priceforMaxBuy.toString(), 'ether'));
    if(DEG) console.log('user1 pay price', web3.utils.fromWei(price.toString(), 'ether'));
    await highGo.buyWithDai(priceforMaxBuy, 10, {from: user1});
    balance = await highGo.balanceOf(user1, {from: user1});
    if(DEG) console.log('user1 owner amount of token', balance.toString());

    // 3. user2 buy a proudct
    priceforMaxBuy = await highGo.getPriceForN(16);
    price = await highGo.getPriceForN(10);
    await daiMock.approve(proxyAddress, priceforMaxBuy, {from: user2});
    if(DEG) console.log('user2 pay max price', web3.utils.fromWei(priceforMaxBuy.toString(), 'ether'));
    if(DEG) console.log('user2 pay price', web3.utils.fromWei(price.toString(), 'ether'));
    await highGo.buyWithDai(priceforMaxBuy, 10, {from: user2});
    balance = await highGo.balanceOf(user2, {from: user2});
    if(DEG) console.log('user2 owner amount of token', balance.toString());
  

    await highGo.tradein(1, {from: user1});
    await highGo.tradein(2, {from: user1});
    await highGo.tradein(3, {from: user1});
    balance = await highGo.balanceOf(user1, {from: user1});
    assert.equal(balance.toString(), 10 - 6);
    if(DEG) console.log('user1 remain token after redeem', balance.toString());

    const printEscrowList = async (list) => await list.reduce( async (_prev, val, index) => {
          const ESCROW_STATE = ['INITIAL', 'AWAITING_SERVER_CHECK', 'AWAITING_DELIVERY', 'AWAITING_USER_APPROVAL', 'COMPLETE_USER_REFUND', 'COMPLETE'];
          const state = ESCROW_STATE[val[0]];
          const amount = val[1];
          const value = val[2];
          console.log('index:', index, 'state:', state, 'amount:', amount, 'value:',  web3.utils.fromWei(value, 'ether'));
          return Promise.resolve("DO_NOT_CALL");
        },0);

    let list = await highGo.getEscrowHistory(user1);
    assert.equal(list.length, 3);
    if(DEG) await printEscrowList(list);

    // 4. redeem compelete
    let id = 0
    if(DEG) console.log('Update completed');
    highGo.updateServerCheck(user1, id);
    highGo.confirmDelivery(user1, id);
    highGo.updateUserCompleted(user1, id);
    list = await highGo.getEscrowHistory(user1);
    if(DEG) await printEscrowList(list);

    let state = await highGo.getRedeemStatus(user1, id);
    assert.equal(state, STATE_COMPLETE);

    // 5. redeem fail then send same amount of product
    id = 1;
    if(DEG) console.log('Update redeem fail');
    balance = await daiMock.balanceOf(user1, {from: user1});
    if(DEG) console.log('user1 balance before refund',  web3.utils.fromWei(balance.toString(), 'ether'));
    highGo.updateServerCheck(user1, id);
    highGo.updateUserRefund(user1, id);
    state = await highGo.getRedeemStatus(user1, id);
    assert.equal(state, STATE_COMPLETE_USER_REFUND);
    list = await highGo.getEscrowHistory(user1);

    if(DEG) console.log('user1 refund',  web3.utils.fromWei(list[id][INDEX_OF_VALUE], 'ether'));
    balance = await daiMock.balanceOf(user1, {from: user1});
    if(DEG) console.log('user1 balance after refund',  web3.utils.fromWei(balance.toString(), 'ether'));
    if(DEG) await printEscrowList(list);
  })

  // it('mulit Token Pricing Functions  update',async function(){
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   let exp_2 = '440000';				// assuming price function exponential factor of 2, input reserve ratio in ppm
	 //  let max_2 = '1000';						// assuming max 500 token will be minted
	 //  let offset_2 = '20';
  //   let baseReserve_2 = web3.utils.toWei('1.44', 'ether');
  //   const data_2 = this.implementationV0.contract.methods.initialize('SuperMax', 'SM', exp_2, max_2, offset_2, baseReserve_2).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "SuperMax", data_2,
  //     );
  //   const highGoProxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   const superMaxProxyAddress = await this.tokenFactory.retrieveToken.call("SuperMax");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(highGoProxyAddress);
  //   const superGov1 = new ProductToken(superMaxProxyAddress);
		// // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   const highGoV2 = new ProductTokenV2(highGoProxyAddress);
  //   const superGoV2 = new ProductTokenV2(superMaxProxyAddress);
  //   const costHighGoV2 = await highGoV2.getPriceForN.call("1")
  //   const costSuperMaxV2 = await superGoV2.getPriceForN.call("1")
		// costHighGoV2.should.be.a.bignumber.that.not.equals(costSuperMaxV2)
  // });

  // it('Availability  Functions  update',async function(){
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(proxyAddress);
  //   const totalSupplyV1 = await highGoV1.getAvailability()
		// // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   const highGoV2 = new ProductTokenV2(proxyAddress);
  //   const totalSupplyV2 = await highGoV2.getAvailability()
		// totalSupplyV1.should.be.a.bignumber.that.not.equals(totalSupplyV2)
  // });

  // it('Skip V2 version  rollback calculateSaleReturn  Functions  update',async function(){
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   // console.log(proxyAddress);
  //   const highGoV1 = new ProductToken(proxyAddress);   
  //   const V1 = await highGoV1.calculateSaleReturn(offset,baseReserve,exp,1)
		// // console.log(cost1.toString())
  //   this.beacon.upgradeTo(this.implementationV1.address);
  //   this.beacon.upgradeTo(this.implementationV2.address);
  //   this.beacon.upgradeTo(this.implementationV3.address);
  //   // const highGoV3 = new ProductTokenV2(proxyAddress);
  //   const V3 = await highGoV1.calculateSaleReturn(offset,baseReserve,exp,1)
		// V1.should.be.a.bignumber.that.equals(V3)
  // });

  // it('Destroy ProductToken is not succeed', async function(){
		// // console.log(cost1.toString())
    
  //   // console.log(proxyAddress);
  //   const data = this.implementationV0.contract.methods.initialize('HighGO', 'HG', exp, max, offset, baseReserve).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", data,
  //     );
  //   const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   const highGoV1 = new ProductToken(proxyAddress);   
    
  //   const costV1 = await highGoV1.getPriceForN("1")
  //   this.beacon.upgradeTo(this.implementationDestroy.address);
  //   const costV2 = await highGoV1.getPriceForN("1")
		// costV1.should.be.a.bignumber.that.equals(costV2)
  // });

  // it('update new initialize by implementationV4 ',async function(){   
  //   this.beacon.upgradeTo(this.implementationV4.address);
  //   // console.log(proxyAddress);
  //   let newInitValue = '1000';
  //   const dataV5 = this.implementationV4.contract.methods.initializeV5('HighGO', 'HG', exp, max, offset, baseReserve,newInitValue).encodeABI();
  //     await this.tokenFactory.createToken(
  //       "HighGO", dataV5,
  //     );
  //     const proxyAddress = await this.tokenFactory.retrieveToken.call("HighGO");
  //   const highGoV5 = new ProductTokenV5(proxyAddress);  
  //   const costV5 = await highGoV5.getNewInitValue()
  //   // console.log(costV5)
		// costV5.should.be.a.bignumber.that.equals(newInitValue)
  // });
});
