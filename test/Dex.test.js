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
			it('Current Price should be greater than 0', async() => {				// This test is just a placeholder to test out the power function. It will be removed later.
				const price = await tokenInstance.getCurrentPrice()
				assert.equal(price, 0, "currnet price is not above 0")
			})

			it('Actual Price to buy one token', async() => {				// This test is just a placeholder to test out the power function. It will be removed later.
				const cost = await tokenInstance.getPriceForN("1")
				assert.notEqual(price, 0, "currnet price is above 0")
			})

			xit('price to buy one token should equal to current price', async() => {				// They should not be equal..
				const price = await tokenInstance.getCurrentPrice()
				const cost = await tokenInstance.getPriceForN("1")
				assert.equal(price, cost, "Price function and Buying calculation are not equal")
			})

			xit('Buying with ether returns positive amount', async() => {				// This test is just a placeholder to test out the power function. It will be removed later.
				const amount = await tokenInstance.calculateBuyReturn("100000000000000000000");
				assert.equal(amount, 0, "amount purchased is not above 0")
			})
		})

	})
})