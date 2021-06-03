const Factory = artifacts.require('TokenFactory');

const BN = require('bn.js')

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bn')(BN))
	.should()

	contract('Factory', (accounts) => {
		let factoryInstance
		describe("Fcatory Logic Checks", async () => {
			beforeEach(async () => {
      	factoryInstance = await Factory.deployed({from: accounts[0]})
    	})

    	it("the owner should be accounts[0]", async() => {
    		const owner = await factoryInstance.owner()
				assert.equal(owner, accounts[0])
    	})

		})
	})