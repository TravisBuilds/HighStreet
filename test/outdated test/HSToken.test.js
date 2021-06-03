const {  assert } = require("chai");
const HSToken= artifacts.require("HSToken");
const {  BN,  expectRevert } = require('@openzeppelin/test-helpers');
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("HSToken", function(accounts) {
  let tokenInstance;
  let minter=accounts[0];
  let alice= accounts[1];
  let bob =accounts[2];
  let carol=accounts[3];
  let EVMRevert="HSToken: It is not the minter";
  let EVMRecertOwn="Ownable: caller is not the owner"
  describe('Token Logic Checks', async () => {
    beforeEach(async () => {
        tokenInstance = await HSToken.new({ from: minter });
    })
    xit("check if mint right", async function() {   // we don't want to pre-mint
        // await HSToken.deployed();
        const totalSupply = await tokenInstance.totalSupply.call({ from: minter })
        assert.equal(totalSupply,'40000000000000000000000000');
      });
    it("check isMinter ", async function(){
        assert.equal((await tokenInstance.isMinter.call(alice)),false);
    })
    it ("can not mint without authorization", async function() {
          await  expectRevert(tokenInstance.mint.call(alice, 100000,{from:bob}),EVMRevert)
    })
    it ("can not add minter by others", async function() {
        await expectRevert(tokenInstance.addMinter.call(bob,{from:bob}),EVMRecertOwn);
    })
      it ("after addMinter by owner, mint by minter should succeed", async function() {
        await tokenInstance.addMinter(alice,{from:minter});
        assert.equal(await tokenInstance.balanceOf(bob),'0');
        await tokenInstance.mint(bob, 100000,{from:alice});
        assert.equal(await tokenInstance.balanceOf(bob),'100000');
        await tokenInstance.mint(bob, 10000,{from:alice});
        assert.equal(await tokenInstance.balanceOf(bob),'110000');
      })

      it ("after delMinter, pre minter can not mint", async function() {
        await tokenInstance.addMinter(alice,{from:minter});
        await tokenInstance.mint(bob, 100000,{from:alice});
        await tokenInstance.delMinter(alice,{from:minter});
        await expectRevert(tokenInstance.mint(bob, 100000,{from:alice}),EVMRevert)
        })

      it ("isMinter and getMinterLength should work well", async function() {
        assert.equal((await tokenInstance.getMinterLength({from:minter})).toString(),"1");
        await tokenInstance.addMinter(alice,{from:minter});
        await tokenInstance.addMinter(bob,{from:minter});
        assert.equal((await tokenInstance.getMinterLength({from:minter})).toString(),"3");
        assert.equal((await tokenInstance.isMinter(alice)),true);
        assert.equal((await tokenInstance.isMinter(bob)),true);
        // assert.equal((await tokenInstance.isMinter(minter)),false);
        await tokenInstance.delMinter(bob,{from:minter});
        assert.equal((await tokenInstance.getMinterLength({from:minter})).toString(),"2");
        assert.equal((await tokenInstance.isMinter(bob)),false);
      })

      it ("getMinter should work well", async function() {
        await tokenInstance.addMinter(alice,{from:minter});
        await tokenInstance.addMinter(bob,{from:minter});
        assert.equal((await tokenInstance.getMinter(1)),alice);
        assert.equal((await tokenInstance.getMinter(2)),bob);
        await expectRevert(tokenInstance.getMinter(3),"HSToken: _index out of bounds");
        await tokenInstance.delMinter(alice,{from:minter});
        assert.equal((await tokenInstance.getMinter(1)),bob);
        await expectRevert(tokenInstance.getMinter(2),"HSToken: _index out of bounds");
      })

      it ("totalSupply should work well", async function() {
        await tokenInstance.addMinter(alice,{from:minter});
        await tokenInstance.mint(bob, 200,{from:alice});
        assert.equal((await tokenInstance.totalSupply()),"200");
      })

      xit ("check can not exeed max supply, and after exceed token transfer should work well", async function() {   // might not include max supply.
        await tokenInstance.addMinter(alice,{from:minter});
        await tokenInstance.mint(bob, "60000000000000000000000000",{from:alice});
        assert.equal((await tokenInstance.balanceOf(bob)),"60000000000000000000000000");
        assert.equal((await tokenInstance.totalSupply()),"100000000000000000000000000");
        // after exceed max supply, no token will mint
        await tokenInstance.mint(bob, 1,{from:alice});
        assert.equal((await tokenInstance.balanceOf(bob)),"60000000000000000000000000");
        assert.equal((await tokenInstance.totalSupply()),"100000000000000000000000000");
        await tokenInstance.mint(carol, "1000000000000000000000000",{from:alice});
        assert.equal((await tokenInstance.balanceOf(carol)),"0");
        assert.equal((await tokenInstance.balanceOf(bob)),"60000000000000000000000000");
        assert.equal((await tokenInstance.totalSupply()),"100000000000000000000000000");
        // transfer should work well
        await tokenInstance.transfer(carol,  "1000000000000000000000000",{from:bob})
        assert.equal((await tokenInstance.balanceOf(carol)),"1000000000000000000000000");
        assert.equal((await tokenInstance.balanceOf(bob)),"59000000000000000000000000");
        assert.equal((await tokenInstance.totalSupply()),"100000000000000000000000000");
      })
  });



});