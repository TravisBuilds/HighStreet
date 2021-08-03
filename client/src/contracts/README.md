# Highstreet smart contracts
HighStreet is the bridge between Virtual Worlds, Real life, and Web managed by smart contracts
on the ethereum chain.
Installing the backend is done in the following manner:

## Install git
```
brew install git
```
## Clone the repository
```
cd highstreet-backend
git clone https://github.com/hyplabs/highstreet-backend.git
```
## Nodejs
```
brew update
brew install node
```
## truffle
Development environment, testing framework and asset pipeline for blockchains using the Ethereum Virtual Machine (EVM)
```
npm install -g truffle
```
## Ganache-cli
Personal Ethereum blockchain which you can use to run tests, execute commands, and inspect state while controlling how the chain operates.
```
npm install ganache-cli
```
run ganache-cli:
```
ganache-cli
```
Output should be your own version of this:
```
Ganache CLI v6.12.2 (ganache-core: 2.13.2)

Available Accounts
==================
(0) 0x33c74eE03564C72B309d5C8f651A9A3a42effcB3 (100 ETH)
(1) 0x0E84137590eB730B5bC212ad817995d0cB28Db0B (100 ETH)
(2) 0x30865cE2e94Ff28d672f98D88A32392B5a7FDa82 (100 ETH)
(3) 0x8e924b52ED1914E5C4B61eb6F6411885DD7D8293 (100 ETH)
(4) 0x2d6cE6bFF7c8e82Ee74b18367A8E8Bdb79b6D6b6 (100 ETH)
(5) 0x2F6420aDab13FB3b9ac0dEcd29d635E1853482A5 (100 ETH)
(6) 0xdFBDfEA498E67f0fc7d44Fe0c5d0CE9990980079 (100 ETH)
(7) 0x7DA9A0A29fe28b79715c6ced4d1A7C082ff430b6 (100 ETH)
(8) 0x7bfe49e4C9a471ecb9f6929bAa004810A7c54c79 (100 ETH)
(9) 0x86F4ce0cF208DA702Cf9e31E45e0fa85b13eB38a (100 ETH)

Private Keys
==================
(0) 0x7f953d83940d37bb20d767625810ffaf66393cb63c9acd825cfa137a1c728d42
(1) 0x8c4d17e35aae38341ee3403f12f7647087e294d12e2bbd6c19c096b35274d0e4
(2) 0xa2c1eaccb4cc72e3bcd9b31cb752abcdb52a0fc94453c92cc533f387b33c517a
(3) 0xe1cb997bf7987c2390a04e9eb9d9fb692f592ae607c77efc508b64be1a681c1b
(4) 0xf9dba49a0159c685347ef7a5b4282be5d599fc06359074bcb41d9aaa924d1c30
(5) 0xb81957fff5a867a79109e3c15771c32a8bd49cad5a9ca52283cf0f278d2bbcd9
(6) 0x2466c5c8f75e0e56bc4baf7d07a5017e460c7d001fb728a422a8d2952092905d
(7) 0x6ab98badca21d87e711de230f2d7d99e23b13fbc7c35f836026b50e3b3e577fb
(8) 0x24772f2bcbbd19a4b9521ec9cf76157d4ab9ab2a446884113425562dc538f71e
(9) 0xd51a9d2e09fbba33fade338551e90d931c5f15082843322ae0e863584d452165

HD Wallet
==================
Mnemonic:      shoulder neutral uphold trash trophy goose vessel route hip venture gesture tank
Base HD Path:  m/44'/60'/0'/0/{account_index}

Gas Price
==================
20000000000

Gas Limit
==================
6721975

Call Gas Limit
==================
9007199254740991
```
Notice endowed accounts, private keys, mnemonics and everything you need to be a ethereous camper.


## docker
   Docker is an open source software platform to create, deploy and manage virtualized application containers    on a common operating system (OS), with an ecosystem of allied tools. 
   We will use it to install and run solidity.
   ```
   brew cask install docker
   ```
## install docker solidity 0.8.2
Solidity is a contract-oriented, high-level language for implementing smart contracts. It was designed to target the Ethereum Virtual Machine (EVM).
   ```
   docker run ethereum/solc:0.5.4
   ```
## install openzeppelin/test dependencies
OpenZeppelin is an open-source framework for building smart contracts.
OpenZeppelin provides a complete suite of security products to build, manage, and inspect all      aspects of software development and operations for Ethereum projects. 
```
   npm install @openzeppelin/contracts
   npm install @openzeppelin/test-helpers
   npm install @openzeppelin/upgrades
   ```
## The truffle test node framework requires these libraries
   ```
   npm install chai-as-promised
   npm install truffle-assertions
   ```
## Install npm dependencies and initialize your truffle project
   ```
   npm install
   ```
   Only if you have not done so already:
   ```
   truffle init  
   ```
   depending on your setup, you might have 
   to enter different answers here,
   you can always restore them in the next step.
   
   ## restore files
   You can see if you removed essential files 
   during the truffle initalization by typing: 
   
   ```
      git status
   ```
   If you did, you can always rectify the situation by typing:
   ```
      git restore <directory_name>
   ```
      
      
   ## metamask
   MetaMask is a software cryptocurrency wallet used to interact with the Ethereum blockchain.
   Metamask is a browser extention installed from within your browser extention manager.
   Login to metamask and create an account with one of the addresses, private-key and mnemonic from    the output of running ganache-cli.
   
  
   ## adjust truffle.config
   This file is in the root directory of the application. 
   The configuration specified in this file will vary according to your setup.
   The existing truffle.config should work with this example.
  
   ## compile
   ```
   truffle compile
   ```
   #### migrate
   ```
   truffle migrate
   ```
## Mongodb
   Insert colections
   1. users
   2. products
   3. markets
   4. communityUsers
    
   
## .env
   edit ".env" file (root dir) with your information
      
      
      NODE_ENV=development
      JWT_SECRET=<your_secret>
      MONGO_URL=<mongo://localhost:27017>
      MONGO_DBNAME=virtualmarket
      INSTAGRAM_CLIENT_ID=
      INSTAGRAM_CLIENT_SECRET=
      INSTAGRAM_CALLBACK_URL=
      
## test
```
   truffle test
```

