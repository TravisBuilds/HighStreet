import React, {useContext, useEffect} from 'react';
import { StoreContext } from '../../contexts/StoreState';
// import { notifyError } from '../../common/Actions';



export default function useInjectedWeb3() {
    const {  setSelectedEthAddr, setInjectedProvider } = useContext(StoreContext);

    //const { dispatch } = useContext(StoreContext);
    let provider;

    useEffect(() => {
      const windowProvider = async() => {
        if (typeof window.ethereum !== 'undefined'
            || (typeof window.web3 !== 'undefined')) {

            provider = window['ethereum'] || window.web3.currentProvider;
 
            try{
               await provider.enable();
            }catch (e){
                console.error('user refused to connect');
               
            }
            //console.log('network:', provider.networkVersion);
            //console.log('selectedAddress:', provider.selectedAddress);
            //console.log('is metamask:', provider.isMetaMask);
          
            // dispatch({
            //     type: ActionType.SET_INJECTED_PROVIDER,
            //     payload: provider
            // })

            setInjectedProvider(provider)

            provider.on('accountsChanged', function(accounts) {
                console.log("accounts changed");
                // dispatch({
                //     type: ActionType.SET_SELECTED_ETH_ADDR,
                //     payload: accounts[0]
                // })
                setSelectedEthAddr(accounts[0])
            })

            provider.on('networkChanged', function(accounts) {
                console.log('networkChanged changed');
                console.log(accounts);
            })

          }
        }

        windowProvider();
    }, [window['ethereum']]);

    return provider;
}