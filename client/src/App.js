import React, { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';





function App() {
  const [userAccount, setUserAccount] = useState(""); 

  window.addEventListener('load', async ()=>{
    if(window.ethereum){
      window.web3 = new Web3(Web3.givenProvider || "http://localhost:8485" );
      
      try{
        const network = await window.web3.eth.net.getNetworkType()
        console.log("network:", network);
        const account =  await window.web3.eth.getAccounts(); 
        console.log("account", account[0]);
        console.log("this is the type of ", typeof account[0]);
        setUserAccount (account[0]);
      }catch(error){
        console.log(error);
      }
    }else{
      console.log("need metamask")
    
    }
  })

 
  return (

    <div className="App">
      your Ethereum address is: {userAccount}
    </div>
  );
}

export default App;
