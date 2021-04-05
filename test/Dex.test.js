const Token = artifacts.require("ProductToken");
const BN = require('bn.js')

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bn')(BN))
	.should()

contract('Token', (accounts) => {
	let exp = 2				// assuming price function exponential factor of 2
	let max = 500			// assuming max 500 token will be minted
	let tokenInstance
	describe('Token Logic Checks', async () => {
		beforeEach(async () => {
        tokenInstance = await Token.new(exp, max)
    })

		it('it has a name', async () => {
			const name = await tokenInstance.name()
			assert.equal(name, "ProductToken")
		})

		context('Pricing Functions', async() => {
			it('Actual Price to buy one token', async() => {			
				const cost = await tokenInstance.getPriceForN.call("1")
				const costBN = new BN(cost)
				// assert.isAbove(costBN, new BN('0'), "currnet price is not above 0")
				costBN.should.be.a.bignumber.that.is.greaterThan('0')
			})

			it('price to purchase 1 token should purchase one token when fed into Buy function', async() => {
				const cost = await tokenInstance.getPriceForN.call("1")
				// console.log(cost.toString())
				// const newCost = cost.toNumber().add(1)		// need to do big number addition here.
				// console.log(newCost.toString())
				const amount = await tokenInstance.calculateBuyReturn.call(cost)
				amount.should.be.a.bignumber.that.equals('1')
			})
		})

		context('Transaction Related Functions', async() => {
			
		})
	})
})
