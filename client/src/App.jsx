import React from 'react';
import Web3Provider, { Connectors } from 'web3-react';
import { Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Market from './pages/Market';
// import Discover from './pages/Discover';
import ComingSoon from './pages/ComingSoon';
import MerchantSignup from './pages/MerchantSignup';
import NavBar from './components/NavBar';
import ProductProvider from './contexts/ProductProvider';
import StoreProvider from './contexts/StoreProvider';
import WalletProvider from './contexts/WalletProvider';

function App() {
  const { InjectedConnector, NetworkOnlyConnector } = Connectors;
  const Metamask = new InjectedConnector({ supportedNetworks: [1, 4] });

  const Infura = new NetworkOnlyConnector({
    providerURL: 'https://mainnet.infura.io/v3/...'
  });

  const connectors = { Metamask, Infura };

  return (
    <>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        {/* <Web3ReactManager> */}
        <BrowserRouter>
          <WalletProvider>
            <ProductProvider>
              <StoreProvider>
                <NavBar />
                <Route exact path="/" component={Home} />
                <Route exact path="/about" component={About} />
                <Route exact path="/market" component={Market} />
                <Route exact path="/merchant-signup" component={MerchantSignup} />
                <Route exact path="/coming-soon" component={ComingSoon} />
                {/* <Route exact path="/discover" component={Discover} /> */}
              </StoreProvider>
            </ProductProvider>
          </WalletProvider>
        </BrowserRouter>
        {/* </Web3ReactManager> */}
      </Web3Provider>
    </>
  );
}

export default App;
