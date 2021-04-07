import React, { createContext, useReducer } from 'react';
import ProductReducer from './ProductReducer';
import kalonCard from '../assets/product1.png';
import loreal from '../assets/product2.png';
import mystery from '../assets/product3.png';
import placeholderCard from '../assets/productplaceholder.png';
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
            img: kalonCard
        },
        {
            name: "L'Oréal ",
            ticker: "OREAL",
            price: 20,
            supply: 2500,           // etc.
            available: 2500,
            img: loreal
        },
        {
            name: "Mystery Box",
            ticker: "RAND",
            price: 15,
            supply: 1000,
            available: 1000,
            img: mystery
        },
        {
            name: "ProductD",
            ticker: "PD",
            price: 122,
            supply: 3000,
            available: 3000,
            img: placeholderCard
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
        
        dispatch({
            type: 'TOKEN_BOUGHT',
            payload: selectedToken
        });
    }

    function tokenSold(product) {
        dispatch({
            type:'TOKEN_SOLD',
            payload: product
        });
    }

    function tokenRedeemed(product){
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
