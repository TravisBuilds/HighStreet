const Token = artifacts.require("LumiToken");

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Token', (accounts) => {
	let ratio = 330000
	let max = 500
	describe('Token Logic Checks', async () => {
		it('it has a name', async () => {
			let lumiToken = await Token.new(ratio, max)
			const name = await lumiToken.name()
			assert.equal(name, "LumiToken")
		})
	})
})