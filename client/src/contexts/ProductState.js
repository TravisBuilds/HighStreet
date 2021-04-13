import React, { createContext, useReducer } from 'react';
import ProductReducer from './ProductReducer';
import kalonCard from '../assets/product1.png';
import loreal from '../assets/product2.png';
import mystery from '../assets/product3.png';
import lvmh from "../assets/product4.png";
import placeholderCard from '../assets/productplaceholder.png';
import kalonfeature from '../assets/kalon.png';
import lvmhfeature from '../assets/lvmh.png';
import lorealfeature from '../assets/lvmh.png';
import randomfeature from '../assets/randomfeature.png';

import { ethers } from 'ethers'; 
import Token from '../build/contracts/ProductToken.json'

const url = 'http://127.0.0.1:8545';
const provider = new ethers.providers.JsonRpcProvider(url);
const networkId = provider.getNetwork.chainId;
console.log('Network ID: ' + networkId);
const networkData = Token.networks[networkId];
if(networkData) {
    const contract = new ethers.Contract(networkData.address, Token.abi, provider);
} else {
    console.log("Contract wasn't deployed properly.");
}

// import ProductToken.sol
//Initial Placeholder 
const initialState = {
    products: [
        {
            name: "Kalon Tea",
            ticker: "KLT",
            price: 12,              
            supply: 500,            // tokenInstance.getSupply()
            available: 500,         // tokenInstance.getAvailability()
            img: kalonCard,
            tagline:"Essence of Nature",
            blurb:"Nature's first green is gold, infused in a liquor that will make it truly last forever",
            feature:kalonfeature 

        },
        {
            name: "L'Oréal ",
            ticker: "OREAL",
            price: 20,
            supply: 2500,           // etc.
            available: 2500,
            img: loreal,
            tagline:"Because you're worth it ",
            blurb:"Be the star that you were always meant to be, L'oreal, because you're worth it",
            feature:lorealfeature
        },
        {
            name: "Mystery Box",
            ticker: "RAND",
            price: 15,
            supply: 1000,
            available: 1000,
            img: mystery,
            tagline:"Try Me",
            blurb:"buy me for the chance to redeem anything in our entire catalog",
            feature: randomfeature
        },
        {
            name: "LVMH",
            ticker: "LVMH",
            price: 122,
            supply: 3000,
            available: 3000,
            img: lvmh,
            tagline:"Making it Real",
            blurb:"A timeless first and a vibrant way to touch up both your digital and IRL identity",
            feature: lvmhfeature

        }
    ]
}

//Create Context
export const ProductContext = createContext(initialState);

//Provider Component 
export const ProductProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ProductReducer, initialState);

    //Actions 
    function tokenBought(selectedToken) {
        console.log("Buy function called")

        dispatch({
            type: 'TOKEN_BOUGHT',
            payload: selectedToken

        });
    }

    function tokenSold(product) { 
        console.log("Sell function called")

        dispatch({
            type:'TOKEN_SOLD',
            payload: product

        });
    }

    function tokenRedeemed(product){
        console.log("Redeem function called")

        dispatch({
            type:'TOKEN_REDEEMED',
            payload: product

        })
    }

    return (
        <ProductContext.Provider value={{
            products: state.products, tokenBought, tokenSold, tokenRedeemed
        }}>
            {children}
        </ProductContext.Provider>
    )
}
