import React, {createContext, useReducer} from 'react';
import ProductReducer from './ProductReducer'; 
import kalonCard from '../assets/product1.png';
import placeholderCard from '../assets/productplaceholder.png';
//Initial Placeholder 
const initialState = {
    products: [
        {
            name: "Kalon Tea",
            ticker: "KLT", 
            price: 12,
            supply: 500,
            img: kalonCard
        },
        {
            name: "ProductB",
            ticker: "PB", 
            price: 20,
            supply: 500,
            img: placeholderCard
        },
        {
            name: "ProductC",
            ticker: "PC", 
            price: 130,
            supply: 1000,
            img: placeholderCard
        },
        {
            name: "ProductD",
            ticker: "PD", 
            price: 122,
            supply: 3000,
            img: placeholderCard
        }
    ]
}

//Create Context
export const ProductContext = createContext(initialState);

//Provider Component 
export const ProductProvider = ({children}) =>{
    const [state, dispatch]  = useReducer(ProductReducer, initialState); 
    
    return(
        <ProductContext.Provider value={{
            products:state.products 
        }}>
            {children}
        </ProductContext.Provider>
    )
}
