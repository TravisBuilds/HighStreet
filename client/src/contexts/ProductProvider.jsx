import React, { createContext, useReducer } from 'react';
// import { McdPlugin } from '@makerdao/dai'; // makerdao is a library that allows for interaction with the DAI coin.
import { ethers } from 'ethers';
import { Bridge } from 'arb-ts';
import ProductReducer from './ProductReducer';
import mystery from '../assets/product3.png';
import randomfeature from '../assets/randomfeature.png';
// abstract bridge interface for solidity
import FactoryProxy from '../build/contracts/ERC1967Proxy.json';
import Factory from '../build/contracts/TokenFactory.json';
import TokenV1 from '../build/contracts/ProductTokenV1.json';
import ERC20 from '../build/contracts/IERC20.json';
import AggregatorV3Interface from '../build/contracts/AggregatorV3Interface.json';

// +++ template fix UI error
const kalonCard = mystery;
const loreal = mystery;
const lvmh = mystery;
const kalonfeature = randomfeature;
const lvmhfeature = randomfeature;
const lorealfeature = randomfeature;
// --- template fix UI error

const DBUG = true;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const formatDaiUnits = async (val) => ethers.utils.formatUnits(val.toString(), 18);
const providerL1 = new ethers.providers.EtherscanProvider('rinkeby');
const providerL2 = new ethers.providers.JsonRpcProvider('https://rinkeby.arbitrum.io/rpc');
const daiAddressL1 = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735';
const daiAddressL2 = '0x552444108a2aF6375205f320F196b5D1FEDFaA51';
const l1GatewayRouter = '0x70C143928eCfFaf9F5b406f7f4fC28Dc43d68380';
const l2GatewayRouter = '0x9413AD42910c1eA60c737dB5f58d1C504498a3cD';
const daiContractL1 = new ethers.Contract(daiAddressL1, ERC20.abi, providerL1);
const daiContractL2 = new ethers.Contract(daiAddressL2, ERC20.abi, providerL2);
const daiEtherAddress = '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D';
const daiEtherContractL1 = new ethers.Contract(daiEtherAddress, AggregatorV3Interface.abi, providerL1);
const isL1Only = true;

let userAccount;
let isValidNetowrk;
let isL1ToL2;
let bridge;

// factoryObj
const netowrkId = 4; // rinkeby
const factoryAddress = FactoryProxy.networks[netowrkId].address;
let factoryContract = new ethers.Contract(factoryAddress, Factory.abi, providerL2);
if (isL1Only) {
  factoryContract = new ethers.Contract(factoryAddress, Factory.abi, providerL1);
}

// tokenObj
let tokenAddress;
let tokenContract;

async function handleChainChanged(_chainId) {
  console.log(_chainId);
  switch (_chainId) {
    case 4:
      console.log('(L1)Rinkeby Testnet');
      await updateContract();
      isL1ToL2 = true;
      break;
    case 421611:
      console.log('(L2)Arbitrum Testnet');
      await updateContract();
      isL1ToL2 = false;
      break;
    default:
      isValidNetowrk = false;
      console.log('not support !!');
  }
}

/*
* Listening MetaMask change chain
*/
window.ethereum.on('chainChanged', (chainId) => {
  // Handle the new chain.
  // Correctly handling chain changes can be complicated.
  // We recommend reloading the page unless you have good reason not to.
  window.location.reload();
});

/*
* Get network Id at beginning
*/
provider.getNetwork().then(async (result) => handleChainChanged(result.chainId));

async function setupBridge() {
  bridge = await Bridge.init(signer, /* l2Signer */ signer, l1GatewayRouter, l2GatewayRouter);
  if (isL1ToL2) {
    bridge.l2Bridge.l2Provider = providerL2;
  } else {
    bridge.l1Bridge.l1Provider = providerL1;
  }
  if (DBUG) {
    console.log(`ether balance 1: ${await formatDaiUnits(await bridge.l1Bridge.l1Provider.getBalance(userAccount))}`);
    console.log(`ether balance 2: ${await formatDaiUnits(await bridge.l2Bridge.l2Provider.getBalance(userAccount))}`);
  }
}

async function approveDaiForBridge() {
  const tx = await bridge.approveToken(daiAddressL1);
  if (DBUG) console.log('waiting approval receipt ...');
  const receipt = await tx.wait();
  if (DBUG) console.log('approval receipt', receipt);

  const data = await bridge.getAndUpdateL1TokenData(daiAddressL1);
  const allowed = data.ERC20 && data.ERC20.allowed;
  console.log('approval allowed', allowed);
}

async function depositDaiToL2(amount) {
  const _tokenData = await bridge.getAndUpdateL1TokenData(daiAddressL1);
  if (!(_tokenData && _tokenData.ERC20)) {
    throw new Error('Token data not found');
  }
  const tokenData = _tokenData.ERC20;
  const amountParsed = await ethers.utils.parseUnits(amount, tokenData.decimals);
  console.log('amountParsed', amountParsed);
  let tx;
  try {
    tx = await bridge.deposit(
      daiAddressL1,
      amountParsed._hex,
      {},
      undefined,
    );

    if (DBUG) console.log('deposit-l1 waiting receipt ...');
    const receipt = await tx.wait();
    if (DBUG) console.log('deposit-l1 receipt', receipt);

    const tokenDepositData = (
      await bridge.getDepositTokenEventData(receipt)
    )[0];

    const seqNum = await bridge.getInboxSeqNumFromContractTransaction(receipt);
    if (DBUG) console.log('seqNum', seqNum);

    const l2RetryableHash = await bridge.calculateL2RetryableTransactionHash(seqNum[0]);
    if (DBUG) console.log('l2RetryableHash', l2RetryableHash);

    const l2RedeemHash = await bridge.calculateRetryableAutoRedeemTxnHash(seqNum[0]);
    if (DBUG) console.log('l2RedeemHash ', l2RedeemHash);

    if (DBUG) console.log('deposit-l2 waiting redeemReceipt receipt ...');
    const redeemReceipt = await providerL2.waitForTransaction(l2RedeemHash, undefined, 1000 * 60 * 10);
    if (DBUG) console.log('deposit-l2 redeemReceipt receipt', redeemReceipt);

    if (DBUG) console.log('deposit-l2 waiting retryableReceipt receipt ...');
    const retryableReceipt = await providerL2.waitForTransaction(
      l2RetryableHash
    );
    if (DBUG) console.log('deposit-l2 retryableReceipt receipt', retryableReceipt);

    if (DBUG) console.log('deposit success');
  } catch (err) {
    console.log('depositDaiToL2 fail:', err, tx.hash);
  }
}

async function depositEtherToL2(amount) {
  let tx;
  try {
    tx = await bridge.depositETH(amount);
    if (DBUG) console.log('deposit-l1 waiting receipt ...');
    const rec = await tx.wait();
    if (DBUG) console.log('deposit-l1 receipt', rec);

    const seqNumArr = await bridge.getInboxSeqNumFromContractTransaction(rec);
    if (seqNumArr === undefined) {
      throw new Error('no seq num');
    }
    const seqNum = seqNumArr[0];
    if (DBUG) console.log('seqNum', seqNum);

    const l2TxHash = await bridge.calculateL2TransactionHash(seqNum);

    if (DBUG) console.log('deposit-l2 waiting l2TxHash receipt ...');
    const l2TxnRec = await providerL2.waitForTransaction(
      l2TxHash,
      undefined,
      1000 * 60 * 12
    );
    if (DBUG) console.log('deposit-l2 l2TxHash receipt', l2TxnRec);

    if (l2TxnRec.status === 1) {
      if (DBUG) console.log('deposit success');
    }
  } catch (err) {
    console.log('depositEtherToL2 fail:', err, tx.hash);
  }
}

async function updateContract() {
  isValidNetowrk = true;
  // userAccount = await provider.listAccounts().then((v) => v);
  userAccount = await signer.getAddress();
  console.log(`userAccount: ${userAccount}`);
}

async function getL2TokenCurrentPrice() {
  return tokenContract.getCurrentPrice();
}

async function getDaiBalanceBothOfL1L2(account) {
  const balanceL1 = await daiContractL1.balanceOf(account);
  const balanceL2 = await daiContractL2.balanceOf(account);
  console.log(`dai balance L1:${await formatDaiUnits(balanceL1)}, ${await formatDaiUnits(balanceL2)}`);
}

async function retrieveTokenByName(name) {
  if (!isValidNetowrk) return;

  const prodName = 'HighGO'; // fixed token name
  await factoryContract.retrieveToken(prodName).then(async (result) => {
    if (DBUG) console.log(`product: ${prodName}, address: ${result}`);
    tokenAddress = result;
    tokenContract = new ethers.Contract(tokenAddress, TokenV1.abi, providerL2);
    if (isL1Only) {
      tokenContract = new ethers.Contract(tokenAddress, TokenV1.abi, providerL1);
    }
  }).catch((e) => {
    console.log(e);
  });
}

function getAvailability() {
  return tokenContract.getAvailability();
}

function getPrice() {
  return tokenContract.getCurrentPrice();
}

function getPriceForN(tokens) { // token must be a number that's smaller than 2^32 - 1
  return tokenContract.getPriceForN(tokens);
}

async function getDaiSigner(address) {
  const contract = new ethers.Contract(address, ERC20.abi, provider);
  return contract.connect(signer);
}

async function getTokenSigner() {
  const contract = new ethers.Contract(tokenAddress, TokenV1.abi, provider);
  return contract.connect(signer);
}

async function buy(cashUpperBound) {
  if (!isValidNetowrk) return;

  const curTokenPrice = await tokenContract.getCurrentPrice();
  const approvalPrice = curTokenPrice.mul('15').div('10');
  if (DBUG) console.log(`current product price ${await formatDaiUnits(curTokenPrice)}`);
  if (DBUG) console.log(`send dai amount(price * 1.5): ${await formatDaiUnits(approvalPrice)}`);

  if (isL1Only) {
    // using dai or ether to buy product
    const isBuyWithDai = false;
    if (isBuyWithDai) {
      console.log('buy with dai');
      const daiSigner = await getDaiSigner(daiAddressL1);
      await daiSigner.approve(tokenAddress, approvalPrice).then(async () => {
        console.log('GET APPROVE');
        const tokenSigner = await getTokenSigner();
        await tokenSigner.buyWithDai(approvalPrice, '1');
      }).catch((e) => {
        console.log(e);
      });
    } else {
      console.log('buy with ether');
      let daiEth = await daiEtherContractL1.latestRoundData();
      console.log(daiEth);
      daiEth = await formatDaiUnits(daiEth.answer);
      const valueInEther = (await formatDaiUnits(approvalPrice)) * daiEth;
      console.log(' ether:', (await formatDaiUnits(curTokenPrice)) * daiEth);
      console.log(' ether(*1.5):', valueInEther);
      const tokenSigner = await getTokenSigner();
      await tokenSigner.buy('1', { value: ethers.utils.parseEther(valueInEther.toFixed(18).toString()) });
    }
  } else if (!isL1ToL2) {
    const daiSigner = await getDaiSigner(daiAddressL2);
    await daiSigner.approve(tokenAddress, approvalPrice).then(async () => {
      console.log('GET APPROVE');
      const tokenSigner = await getTokenSigner();
      await tokenSigner.buyWithDai(approvalPrice, '1');
    }).catch((e) => {
      console.log(e);
    });
  } else {
    if (DBUG) {
      // try to get L2 token price when we at L1
      const price = await getL2TokenCurrentPrice();
      console.log(`current product price ${await formatDaiUnits(price)}`);
      // try to get both of l1 l2 dai balance
      await getDaiBalanceBothOfL1L2(userAccount);
    }
    await setupBridge();
    await approveDaiForBridge();
    await depositDaiToL2(await formatDaiUnits(approvalPrice));
    await depositDaiToL2('100');
    await depositEtherToL2(ethers.utils.parseEther('0.1'));
  }
}

async function sell(tokenAmount) { // token must be a number that's smaller than 2^32 - 1
  if (!isValidNetowrk) return;
  if (isL1Only || !isL1ToL2) {
    const tokenSigner = await getTokenSigner();
    await tokenSigner.sell('1');
  }
}

async function tradeIn(tokenAmount) { // token must be a number that's smaller than 2^32 - 1
  const tokenSigner = await getTokenSigner();
  await tokenSigner.tradein(1);
}

// import ProductToken.sol
// Initial Placeholder
const initialState = {
  products: [
    {
      name: 'Kalon Tea',
      ticker: 'KLT',
      price: 1,
      supply: 500, // tokenInstance.getSupply()
      available: 500, // tokenInstance.getAvailability()
      img: kalonCard,
      tagline: 'Essence of Nature',
      blurb: "Nature's first green is gold, infused in a liquor that will make it truly last forever",
      feature: kalonfeature
    },
    {
      name: "L'Oréal ",
      ticker: 'OREAL',
      price: 20,
      supply: 2500, // etc.
      available: 2500,
      img: loreal,
      tagline: "Because you're worth it ",
      blurb: "Be the star that you were always meant to be, L'oreal, because you're worth it",
      feature: lorealfeature
    },
    {
      name: 'Mystery Box',
      ticker: 'RAND',
      price: 15,
      supply: 1000,
      available: 1000,
      img: mystery,
      tagline: 'Try Me',
      blurb: 'buy me for the chance to redeem anything in our entire catalog',
      feature: randomfeature
    },
    {
      name: 'LVMH',
      ticker: 'LVMH',
      price: 122,
      supply: 3000,
      available: 3000,
      img: lvmh,
      tagline: 'Making it Real',
      blurb: 'A timeless first and a vibrant way to touch up both your digital and IRL identity',
      feature: lvmhfeature
    }
  ]
};

// Create Context
const ProductContext = createContext(initialState);

// Provider Component
const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ProductReducer, initialState);

  // Actions
  async function tokenBuy(product) {
    const a = await retrieveTokenByName(product.name);
    await buy(a).then((result) => {
      // dispatch({
      //   type: 'TOKEN_BOUGHT',
      //   product,
      //   result
      // });
    }).catch((e) => {
      console.log(e);
    });
  }

  async function tokenSell(product) {
    const a = await retrieveTokenByName(product.name);
    await sell(a).then((result) => {
      console.log(result);
      // dispatch({
      //   type: 'TOKEN_SOLD',
      //   product,
      //   result
      // });
    }).catch((e) => {
      console.log(e);
    });
  }

  async function tokenRedeem(product) {
    const a = await retrieveTokenByName(product.name);
    await tradeIn(a).then((result) => {
      console.log(result);
      // dispatch({
      //   type: 'TOKEN_REDEEMED',
      //   product,
      //   result
      // });
    }).catch((e) => {
      console.log(e);
    });
  }

  async function tokenAvailable(product) {
    const a = await retrieveTokenByName(product.name);
    await getAvailability(a).then((available) => {
      console.log(`Tokens available:${available}`);
      dispatch({
        type: 'TOKEN_AVAILABLE',
        product,
        available
      });
    }).catch((e) => {
      console.log(e);
    });
  }

  async function tokenPrice(product) {
    const a = await retrieveTokenByName(product.name);
    await getPrice(a).then((price) => {
      const etherPrice = ethers.utils.formatEther(price);
      console.log(`Price retrieved:${etherPrice}`);
      dispatch({
        type: 'TOKEN_PRICE',
        product,
        etherPrice
      });
    }).catch((e) => {
      console.log(e);
    });
  }

  return (
    <ProductContext.Provider value={{
      products: state.products,
      tokenAvailable,
      tokenPrice,
      tokenBuy,
      tokenSell,
      tokenRedeem
    }}
    >
      {children}
    </ProductContext.Provider>
  );
};

ProductProvider.context = ProductContext;

export default ProductProvider;
