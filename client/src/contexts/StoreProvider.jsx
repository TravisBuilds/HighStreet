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
};

// Create Context
const StoreContext = createContext(initialState);

// Provider Component
const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(StoreReducer, initialState);

  // Actions
  function setSelectedEthAddr(addr) {
    dispatch({
      type: 'SET_SELECTED_ETH_ADDR',
      payload: addr
    });
  }

  function setEthWeb3(provider) {
    dispatch({
      type: 'SET_ETH_WEB3',
      payload: provider
    });
  }

  function setEthBalance(balance) {
    dispatch({
      type: 'SET_ETH_BALANCE',
      payload: balance
    });
  }
  function setInjectedProvider(provider) {
    dispatch({
      type: 'SET_INJECTED_PROVIDER',
      payload: provider
    });
  }
  function setEthersProvider(provider) {
    dispatch({
      type: 'SET_ETHERS_PROVIDER',
      payload: provider
    });
  }
  function setLoomObj(loomObj) {
    dispatch({
      type: 'SET_LOOM_OBJ',
      payload: loomObj
    });
  }
  function setLoomConnectionInfo(connection) {
    dispatch({
      type: 'SET_LOOM_CONNECTION_INFO',
      payload: connection
    });
  }

  return (
    <StoreContext.Provider
      value={{
        store: state,
        setSelectedEthAddr,
        setEthWeb3,
        setEthBalance,
        setInjectedProvider,
        setEthersProvider,
        setLoomObj,
        setLoomConnectionInfo
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

StoreProvider.context = StoreContext;

export default StoreProvider;
