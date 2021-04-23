const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const Token = artifacts.require('ProductToken');
const BN = require('bn.js')

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bn')(BN))
	.should()

contract('Token (proxy)', function () {
	const exp = 330000				// assuming price function exponential factor of 2, input reserve ratio in ppm
	const max = 500						// assuming max 500 token will be minted
	const offset = 10
	const baseReserve = web3.utils.toWei('0.33', 'ether')
	let tokenProxyInstance
  beforeEach(async function () {
    // Deploy a new Box contract for each test
    tokenProxyInstance = await deployProxy(Token, [xp, max, offset, baseReserve], {initializer: 'initialize'});
  });
});