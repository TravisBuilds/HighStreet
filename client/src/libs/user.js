const Web3 = require('web3');

function save({ email, walletAddress, avatarUrl }) {
  return fetch('/api/user/connectMetamask', {
    method: 'POST',
    body: JSON.stringify({
      email,
      walletAddress,
      avatarUrl
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json());
}

const connectWallet = async (context) => {
  if (window.ethereum) {
    window.web3 = new Web3(Web3.givenProvider || 'http://localhost:8485');
    try {
      const network = await window.web3.eth.net.getNetworkType();
      // console.log('network:', network);
      const account = await window.web3.eth.getAccounts();
      console.log('account', account[0]);

      save(account[0], '');
      context.setWallet({ address: account[0] });
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log('need metamask');
  }
};

export default {
  connectWallet,
  save
};
