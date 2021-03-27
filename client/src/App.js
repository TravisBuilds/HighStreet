import React, { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';
import {Home} from "./pages/Home";
import {Profile} from "./pages/Profile";
import {Trade} from "./pages/Trade";
import {Discover} from "./pages/Discover";
import{Router, Route, BrowserRouter} from 'react-router-dom'; 
import {UserProvider} from './contexts/UserProvider'; 





function App() {
  

 
  return (
    <BrowserRouter>
      <UserProvider>
        {/* <Route path="/" component= {NavBar}/> */}
        <Route path='/profile' component = {Profile}/>
        <Route path='/trade' component = {Trade}/>
        <Route path='/discover' component = {Discover}/>

      </UserProvider>
    </BrowserRouter>
    
  );
}

export default App;
