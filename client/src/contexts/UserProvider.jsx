import React, { createContext, useState } from 'react';
import Web3 from 'web3';
import User from '../libs/user';

const context = createContext(null);
const UserProvider = ({ children }) => {
  const [userAccount, setUserAccount] = useState('');

  window.addEventListener('load', async () => {
    if (window.ethereum) {
      window.web3 = new Web3(Web3.givenProvider || 'http://localhost:8485');

      try {
        const network = await window.web3.eth.net.getNetworkType();
        console.log('network:', network);
        const account = await window.web3.eth.getAccounts();
        console.log('account', account[0]);

        User.connectMetamask(account[0], '');
        setUserAccount(account[0]);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('need metamask');
    }
  });

  return (
    <context.Provider value={userAccount}>
      {children}
    </context.Provider>
  );
};

UserProvider.context = context;

export default UserProvider;
