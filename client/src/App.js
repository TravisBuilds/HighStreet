import React from 'react';

import GlobalStyle, {ThemeProvider} from './theme'; 
import{Router, Route, BrowserRouter, Redirect, Switch} from 'react-router-dom'; 
import {UserProvider} from './contexts/UserProvider'; 

import {Home} from "./pages/Home";
import {Profile} from "./pages/Profile";
import {Trade} from "./pages/Trade";
import {Discover} from "./pages/Discover";




function App() {
  
  return (
    <ThemeProvider>
      <GlobalStyle>
        <Web3Provider connectors={connectors} libraryName={'ethers.js'}>
          <Web3ReactManager>
            <BrowserRouter>
             <UserProvider>
                {/* <Route path="/" component= {NavBar}/> */}
                <Route path='/profile' component = {Profile}/>
                <Route path='/trade' component = {Trade}/>
                <Route path='/discover' component = {Discover}/>

              </UserProvider>
                <Route path='/' component = {Home}/>
             </BrowserRouter>
          </Web3ReactManager>
        </Web3Provider>
      </GlobalStyle>
    </ThemeProvider>
  );
}

export default App;
