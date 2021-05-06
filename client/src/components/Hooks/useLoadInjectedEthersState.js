import { useContext, useEffect } from 'react';
import { ethers } from 'ethers';

import StoreProvider from '../../contexts/StoreProvider';

export default function useLoadInjectedEthersState() {
  const { store, setSelectedEthAddr, setEthBalance, setEthersProvider } = useContext(StoreProvider.context);

  useEffect(() => {
    if (store.injectedProvider) {
      if (store.injectedProvider.selectedAddress) {
        // dispatch({
        //   type: ActionType.SET_SELECTED_ETH_ADDR,
        //   payload: state.injectedProvider.selectedAddress
        // });

        setSelectedEthAddr(store.injectedProvider);
      } else {
        console.warn('dont have selected address, yet');
      }
    }
  }, [store.injectedProvider]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (store.injectedProvider) {
        const provider = new ethers.providers.Web3Provider(store.injectedProvider);
        const balance = await provider.getBalance(store.selectedEthAddr);
        const converted = await ethers.utils.formatEther(balance);

        setEthersProvider(provider);
        setEthBalance(converted);
      }
    };

    if (store.selectedEthAddr) {
      fetchBalance();
    }
  }, [store.selectedEthAddr]);
}
