import React, {useContext, useEffect} from 'react';
import { StoreContext } from '../../contexts/StoreState';
import { ethers } from 'ethers';



export default function useLoadInjectedEthersState() {
  const { store, setSelectedEthAddr, setEthWeb3, setEthBalance, setInjectedProvider, setEthersProvider, setLoomObj, setLoomConnectionInfo } = useContext(StoreContext);

  
  useEffect(() => {
    if (state.injectedProvider){
      console.log("using ethers");

      if (state.injectedProvider.selectedAddress){

        dispatch({
          type: ActionType.SET_SELECTED_ETH_ADDR,
          payload: state.injectedProvider.selectedAddress
        });

      }else{
        console.warn('dont have selected address, yet');
      }
    }
  }, [state.injectedProvider]);



  useEffect(() => {
    const fetchBalance = async() => {
      if (state.injectedProvider){
        let provider = new ethers.providers.Web3Provider(state.injectedProvider);
        let balance = await provider.getBalance(state.selectedEthAddr);
        let converted = await ethers.utils.formatEther(balance);

        dispatch({
          type: ActionType.SET_ETHERS_PROVIDER,
          payload: provider
        })

        dispatch({
          type: ActionType.SET_ETH_BALANCE,
          payload: converted
        })
      }
    }

    if (state.selectedEthAddr){
      fetchBalance();
    }
  }, [state.selectedEthAddr])
}