import React from 'react'
import Web3 from 'web3';
import{Router, Route, BrowserRouter, Redirect, Switch} from 'react-router-dom'; 


export const Home = () => {

    const [userAccount, setUserAccount] = useState('') ;

    window.addEventListener('load', async ()=>{
        if (window.ethereum){
            window.web3 = new Web3(Web3.givenprovider || "http://localhost:8485");
        try{
            const network = await window.web3.eth.net.getNetworkType()
            console.log("network, ", network);
            const account = await window.web3.eth.net.getAccount();
            console.log("account", account[0]);
            setUserAccount (account[0]);
        }catch(error){
            console.log(error);
        }
        }else{ console.log("need metamask")
    }
    })
    return (
        <div>
            your Ethereum address is : {userAccount} 
        </div>
    )
}
