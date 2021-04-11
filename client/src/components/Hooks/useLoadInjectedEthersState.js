import React, {useContext, useEffect} from 'react';
import { StoreContext } from '../../contexts/StoreState';
import { ethers } from 'ethers';



export default function useLoadInjectedEthersState() {
  const { store, setSelectedEthAddr,setEthBalance,  setEthersProvider } = useContext(StoreContext);

  
  useEffect(() => {
    if (store.injectedProvider){
      console.log("using ethers");

      if (store.injectedProvider.selectedAddress){

        // dispatch({
        //   type: ActionType.SET_SELECTED_ETH_ADDR,
        //   payload: state.injectedProvider.selectedAddress
        // });
      
        setSelectedEthAddr(store.injectedProvider)

      }else{
        console.warn('dont have selected address, yet');
      }
    }
  }, [store.injectedProvider]);



  useEffect(() => {
    const fetchBalance = async() => {
      if (store.injectedProvider){
        let provider = new ethers.providers.Web3Provider(store.injectedProvider);
        let balance = await provider.getBalance(store.selectedEthAddr);
        let converted = await ethers.utils.formatEther(balance);


        setEthersProvider(provider) 

      
        setEthBalance(converted)
      }
    }

    if (store.selectedEthAddr){
      fetchBalance();
    }
  }, [store.selectedEthAddr])
}