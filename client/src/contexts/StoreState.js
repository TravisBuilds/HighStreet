import React, { createContext, useReducer } from 'react';
import StoreReducer from './StoreReducer';


const initialState = {

    selectedEthAddr: '--',
    ethWeb3: null,
    ethBalance: '--',
    injectedProvider: null,
    ethersProvider: null,
    loomObj: null,
    loomConnectionInfo: null
    
}

//Create Context
export const StoreContext = createContext(initialState);

//Provider Component 
export const ProductProvider = ({ children }) => {
    const [state, dispatch] = useReducer(StoreReducer, initialState);

    //Actions 
    function setSelectedEthAddr(addr) {
        
        dispatch({
            type: 'SET_SELECTED_ETH_ADDR',
            payload: addr
        });
    }

    function setEthWeb3(provider) {
        dispatch({
            type:'SET_ETH_WEB3',
            payload: provider
        });
    }

    function setEthBalance(balance){
        dispatch({
            type:'SET_ETH_BALANCE',
            payload: balance
        })
    }
    function setInjectedProvider(provider){
        dispatch({
            type:'SET_ETH_BALANCE',
            payload: provider
        })
    }
    function setEthersProvider(provider){
        dispatch({
            type:'SET_ETH_BALANCE',
            payload: provider
        })
    }
    function setLoomObj(loomObj){
        dispatch({
            type:'SET_ETH_BALANCE',
            payload: loomObj
        })
    }
    function setLoomConnectionInfo(connection){
        dispatch({
            type:'SET_ETH_BALANCE',
            payload: connection
        })
    }

    return (
        <ProductContext.Provider value={{
            store: state, setSelectedEthAddr, setEthWeb3, setEthBalance, setInjectedProvider, setEthersProvider, setLoomObj, setLoomConnectionInfo
        }}>
            {children}
        </ProductContext.Provider>
    )
}
