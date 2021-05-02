import React, { createContext, useState } from 'react';

const context = createContext({});
const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState({});

  return (
    <context.Provider value={{ wallet, setWallet }}>
      {children}
    </context.Provider>
  );
};

WalletProvider.context = context;

export default WalletProvider;
