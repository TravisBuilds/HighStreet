import React, { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';

window.addEventListener('load', async ()=>{
  if(window.ethereum){
    window.web3 = new Web3(Web3.givenProvider || "http://localhost:8485" );
    
    try{
      const network = await window.web3.eth.net.getNetworkType()
      console.log("network:", network);
    }catch(error){
      console.log(error);
    }
  }else{
    console.log("need metamask")
  
  }
})



function App() {
 
  return (

    <div className="App">
      your Ethereum address is:
    </div>
  );
}

export default App;
