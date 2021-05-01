import { useContext, useEffect } from 'react';
import { StoreContext } from '../../contexts/StoreState';

export default function useInjectedWeb3() {
  const { setSelectedEthAddr, setInjectedProvider } = useContext(StoreContext);

  let provider;

  useEffect(() => {
    const windowProvider = async () => {
      if (typeof window.ethereum !== 'undefined'
            || (typeof window.web3 !== 'undefined')) {
        provider = window.ethereum || window.web3.currentProvider;

        try {
          await provider.enable();
        } catch (e) {
          console.error('user refused to connect');
        }
        // console.log('network:', provider.networkVersion);
        // console.log('selectedAddress:', provider.selectedAddress);
        // console.log('is metamask:', provider.isMetaMask);

        setInjectedProvider(provider);

        provider.on('accountsChanged', (accounts) => {
          console.log('accounts changed');

          setSelectedEthAddr(accounts[0]);
        });

        provider.on('networkChanged', (accounts) => {
          console.log('networkChanged changed');
          console.log(accounts);
        });
      }
    };

    windowProvider();
  }, [window.ethereum]);

  return provider;
}
