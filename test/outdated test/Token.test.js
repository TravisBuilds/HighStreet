const Token = artifacts.require('ProductToken');
const BN = require('bn.js')

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bn')(BN))
	.should()

contract('Token', (accounts) => {
	let exp = 330000				// assuming price function exponential factor of 2, input reserve ratio in ppm
	let max = 500						// assuming max 500 token will be minted
	let offset = 3
	let baseReserve = web3.utils.toWei('9', 'ether')
	let tokenInstance
	let buyer
	describe('Token Logic Checks', async () => {
		beforeEach(async () => {
        tokenInstance = await Token.new(exp, max, offset, baseReserve)
        buyer = accounts[1]
    })

		it('it has a name', async () => {
			const name = await tokenInstance.name()
			assert.equal(name, 'ProductToken')
		})

		xcontext('Pricing Functions', async() => {
			it('Actual Price to buy one token', async() => {
				const cost = await tokenInstance.getPriceForN.call('1')
				// assert.isAbove(costBN, new BN('0'), "currnet price is not above 0")
				cost.should.be.a.bignumber.that.is.greaterThan('0')
			})

			it('price to purchase 1 token should purchase one token when fed into Buy function', async() => {
				const cost = await tokenInstance.getPriceForN.call("1")
				console.log(cost.toString())
				// const newCost = cost.toNumber().add(1)		// need to do big number addition here.
				const newCost = cost.add(new BN('1'))			// round up for rounding...?
				const amount = await tokenInstance.calculateBuyReturn.call(newCost)
				amount.should.be.a.bignumber.that.equals('1')
			})
		})

		context('Transaction Related Functions', async() => {
			xit('account 1 buying one token using ether', async() => {
				const cost = await tokenInstance.getPriceForN.call('1')
				const newCost = cost.add(new BN('1'))			// round up for rounding...?
				await tokenInstance.buy({value: newCost, from: buyer})
				const balance = await tokenInstance.balanceOf.call(buyer)
				balance.should.be.a.bignumber.that.equals('1')
				const supply = await tokenInstance.totalSupply.call()
				supply.should.be.a.bignumber.that.equals('2')
			})

			it('account 1 buying one token with extra should return change', async() => {
				const cost = await tokenInstance.getPriceForN.call('1')
				const newCost = cost.add(new BN('100000'))			
				// console.log(cost.toString())
				await tokenInstance.buy({value: newCost, from: buyer})
				// check for transaction events
			})

			// add test case to test change returned by function
			xit('selling the same amount after buying should cost the same', async() => {			// This of course, is assuming if we don't take transaction fees
				const cost = await tokenInstance.getPriceForN.call('1')
				const newCost = cost.add(new BN('1'))			// round up for rounding...?
				console.log(newCost.toString())
				await tokenInstance.buy({value: newCost, from: buyer})
				const sell = await tokenInstance.calculateSellReturn.call('1')
				console.log(sell.toString())
				sell.should.be.a.bignumber.that.equals(cost)
			})

		})
	})
})
