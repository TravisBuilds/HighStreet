// const { default: Web3 } = require("web3");
const {  assert } = require("chai");
// const BN = web3.utils.BN;
const {  BN,  expectRevert } = require('@openzeppelin/test-helpers');
// const { show } = require("./helper/meta.js");
const HSToken= artifacts.require("HSToken");
const Airdrop= artifacts.require("Airdrop");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("Airdrop", function(accounts) {
  let hsToken, airdrop;
  let minter =accounts[0]
  let alice= accounts[1];
  let bob =accounts[2];
  let carol=accounts[3];
  describe('Token Logic Checks', async () => {
    beforeEach(async() => {
        hsToken = await HSToken.new();
        airdrop = await Airdrop.new();
        await hsToken.mint(minter, 300000, {from: minter});
      });

      it("sendEqual should work well", async function() {
       const AMOUNT = 100000;
       let addressList = [alice, bob, carol]
       await hsToken.approve(airdrop.address, AMOUNT * addressList.length);
       await airdrop.sendEqual(hsToken.address, addressList, AMOUNT)  
       expect((await hsToken.balanceOf(alice)).toString()).to.equal(AMOUNT.toString())
       expect((await hsToken.balanceOf(bob)).toString()).to.equal(AMOUNT.toString())
       expect((await hsToken.balanceOf(carol)).toString()).to.equal(AMOUNT.toString())
      });

      it("send should work well", async function() {
        let addressList = [alice, bob, carol]
        let amountList = ["100000", "100", "10000"]
        let totalAmount = "110100"
        await hsToken.approve(airdrop.address, totalAmount);

        await airdrop.send(hsToken.address, addressList, amountList)

        expect((await hsToken.balanceOf(alice)).toString()).to.equal(amountList[0].toString())
        expect((await hsToken.balanceOf(bob)).toString()).to.equal(amountList[1].toString())
        expect((await hsToken.balanceOf(carol)).toString()).to.equal(amountList[2].toString())
       });

       // xit("sendEtherEqual should work well", async function() {
       //  const AMOUNT = 10000;
       //  let addressList = [alice, bob, carol]

       //  await airdrop.sendEtherEqual(addressList, AMOUNT, {value: AMOUNT * addressList.length})

       //  expect((await web3.eth.getBalance(alice)).toString()).to.equal("10000000000000000010000");
       //  expect((await web3.eth.getBalance(bob)).toString()).to.equal("10000000000000000010000");
       //  expect((await web3.eth.getBalance(carol)).toString()).to.equal("10000000000000000010000");
       // });

  })
});