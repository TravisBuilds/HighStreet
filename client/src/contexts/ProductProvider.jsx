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
let isValidNetowrk;

// factoryObj
let factoryAddress;
let factoryContract;

// tokenObj
let tokenAddress;
let tokenContract;
let tokenSigner;

// daiObj
let daiAddress;
let daiContract;
let daiSigner;

async function handleChainChanged(_chainId) {
  switch (_chainId) {
    case 4:
      console.log('(L1)Rinkeby Testnet');
      daiAddress = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735';
      await updateContract(_chainId);
      break;
    case 421611:
      console.log('(L2)Arbitrum Testnet');
      daiAddress = '0x552444108a2aF6375205f320F196b5D1FEDFaA51';
      await updateContract(_chainId);
      break;
    default:
      isValidNetowrk = false;
      console.log('not support !!');
  }
}

/*
* Listening MetaMask change chain
*/
window.ethereum.on('chainChanged', handleChainChanged);
/*
* Get network Id at beginning
*/
provider.getNetwork().then(async (result) => handleChainChanged(result.chainId));

async function updateContract(_chainId) {
  isValidNetowrk = true;
  factoryAddress = FactoryProxy.networks[_chainId].address;
  factoryContract = new ethers.Contract(factoryAddress, Factory.abi, provider);
  daiContract = new ethers.Contract(daiAddress, ERC20.abi, provider);
  daiSigner = await daiContract.connect(signer);
}

async function retrieveTokenByName(name) {
  if (!isValidNetowrk) return;

  const prodName = 'HighGO';
  await factoryContract.retrieveToken(prodName).then(async (result) => {
    if (DBUG) console.log(`product: ${prodName}, address: ${result}`);
    tokenAddress = result;
    tokenContract = new ethers.Contract(tokenAddress, TokenV1.abi, provider);
    tokenSigner = tokenContract.connect(signer);
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

const formatDaiUnits = async (val) => ethers.utils.formatUnits(val.toString(), 18);

async function buy(cashUpperBound) {
  if (!isValidNetowrk) return;

  const curTokenPrice = await tokenContract.getCurrentPrice();
  console.log(`current product price ${await formatDaiUnits(curTokenPrice)}`);

  const approvlPrice = curTokenPrice.mul('15').div('10');
  console.log(`send dai amount(price * 1.5): ${await formatDaiUnits(approvlPrice)}`);

  await daiSigner.approve(tokenAddress, approvlPrice).then(async () => {
    console.log('GET APPROVE');
    await tokenSigner.buyWithDai(approvlPrice, '1');
  }).catch((e) => {
    console.log(e);
  });
}

async function sell(tokenAmount) { // token must be a number that's smaller than 2^32 - 1
  if (!isValidNetowrk) return;
  await tokenSigner.sell('1');
}

async function tradeIn(tokenAmount) { // token must be a number that's smaller than 2^32 - 1
  await tokenSigner.tradein(tokenAmount);
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
