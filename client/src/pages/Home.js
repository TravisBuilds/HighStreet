import React,{useState}from 'react'
import Web3 from 'web3';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Carousel from 'react-bootstrap/Carousel';
import{Router, Route, BrowserRouter, Redirect, Switch} from 'react-router-dom'; 
import styled from 'styled-components'

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
    console.log("your Ether Address is, " ,{userAccount});
    return (
        <div class="landing">
            <div id="jumbo">
                <Jumbotron color="blue">
                        <p><strong>Buy, Trade, and Redeem</strong></p>
                        <p>Limited Edition Products From The Most Exciting Brands</p>
                        <h1>
                        The first Virtual Marketplace <br></br>pegged to Real Products 
                        </h1>
                        <p>
                            <Button variant="primary">Metamask</Button>
                            <Button variant="outline-secondary" className="mx-auto my-2" >For Brands</Button>{'   '}
                        </p>
                    </Jumbotron>
            </div>
            <div id="Caro">
                <Carousel>
                    <Carousel.Item interval={1000}>
                        <img
                        className="d-block w-100"
                        src="holder.js/800x400?text=First slide&bg=373940"
                        alt="First slide"
                        />
                        <Carousel.Caption>
                        <h3>First slide label</h3>
                        <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item interval={500}>
                        <img
                        className="d-block w-100"
                        src="holder.js/800x400?text=Second slide&bg=282c34"
                        alt="Second slide"
                        />
                        <Carousel.Caption>
                        <h3>Second slide label</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src="holder.js/800x400?text=Third slide&bg=20232a"
                        alt="Third slide"
                        />
                        <Carousel.Caption>
                        <h3>Third slide label</h3>
                        <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </div>
        </div>
    )
    
}

