import React from 'react';
import Web3 from 'web3';
import Web3Provider, { Connectors } from 'web3-react';
import { ethers } from 'ethers';
import { Route, BrowserRouter, Redirect, Switch } from 'react-router-dom';
import { UserProvider } from './contexts/UserProvider';
import Web3ReactManager from './components/Web3ReactManager';
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Trade } from "./pages/Trade";
import { Discover } from "./pages/Discover";
import { NavBar } from "./components/NavBar";
import { ProductProvider } from './contexts/ProductState';
import {StoreProvider} from './contexts/StoreState'; 
import { TradeCard } from './components/TradeCard';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  const { InjectedConnector, NetworkOnlyConnector } = Connectors
  const Metamask = new InjectedConnector({ supportedNetworks: [1, 4] })

  const Infura = new NetworkOnlyConnector({
    providerURL: 'https://mainnet.infura.io/v3/...'
  })

  const connectors = { Metamask, Infura }

  return (

    <>

      <Web3Provider connectors={connectors} libraryName={'ethers.js'}>
        {/* <Web3ReactManager> */}
        <BrowserRouter>
          <UserProvider>
  
            <Route path="/" component={NavBar} />
            <Route path='/about' component={About} />
            <ProductProvider>
            <StoreProvider>
              <Route exact path='/trade' component={Trade} />
              <Route exact path='/discover' component={Discover}/>
              <Route exact path='/' component={Home} />
              </StoreProvider>
            </ProductProvider>
          </UserProvider>
        </BrowserRouter>
        {/* </Web3ReactManager> */}
      </Web3Provider>

    </>

  );
}

export default App;
