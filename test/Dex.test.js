const Token = artifacts.require("ProductToken");

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Token', (accounts) => {
	let exp = 2
	let max = 500
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
			it('Current Price should be greater than 0', async() => {				// The implementation of getCurrentPrice is very misleading
																																			// as this only return base on the price function, not how much it takes to buy one token
																																			// As such, this test will be removed later.
				const price = await tokenInstance.getCurrentPrice.call()
				assert.isAbove(price, web3.utils.toWei('0', 'ether') , "currnet price is not above 0")
			})

			it('Actual Price to buy one token', async() => {				// This test is just a placeholder to test out the power function. It will be removed later.
				const cost = await tokenInstance.getPriceForN("1")
				assert.notEqual(cost, 0, "currnet price is above 0")
			})

			it('price to purchase 1 token should purchase one token when fed into Buy function', async() => {
				const cost = await tokenInstance.getPriceForN.call("1")
				console.log(cost.toString())
				// const newCost = cost.toNumber().add(1)		// need to do big number addition here.
				// console.log(newCost.toString())
				const amount = await tokenInstance.calculateBuyReturn.call(cost)
				// console.log(amount.toString())
				assert.equal(amount, 1, "Price calculated for one token cannot buy one token")
			})

			// Add sell test later, when buying functions for tokens are implemented.

		})

	})
})
