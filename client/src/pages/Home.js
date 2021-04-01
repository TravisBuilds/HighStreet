import React,{useState}from 'react'
import Web3 from 'web3';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Carousel from 'react-bootstrap/Carousel';
import{Router, Route, BrowserRouter, Redirect, Switch} from 'react-router-dom'; 
import styled from 'styled-components'
import source1 from '../assets/lvmh.png'
import source2 from '../assets/kalon.png'


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
                <Jumbotron style={{ background: '#4A90E2', color: 'white' }}>
                        <p><strong>Buy, Trade, and Redeem</strong></p>
                        <p>Limited Edition Products From The Most Exciting Brands</p>
                        <h1>
                        The first Virtual Marketplace <br></br>pegged to Real Products 
                        </h1>
                        <div className="mb-2">
                            <p>
                                <Button variant="light" style={{color: 'black'}}>Metamask</Button>
                                <Button variant="outline-light" style={{color: 'white', padding: "5px"}}  >For Brands</Button>{'   '}
                            </p>
                        </div>
                    </Jumbotron>
            </div>
            <div id="Caro">
                <Carousel>
                    <Carousel.Item interval={5000}>
                    <CardDeck>
                        <Card style={{ width: '30rem' , color:'white'}}>
                            <Card.Img src={source1} alt="Card image" />
                            <Card.ImgOverlay>
                                <Card.Title>Making it Real</Card.Title>
                                <Card.Text>
                                A timeless first and a vibrant way to touch up both your digital and IRL identity
                                </Card.Text>
                                <Button variant="primary">Discover</Button>
                            </Card.ImgOverlay>
                        </Card>
                        
                        <Card style={{ width: '30rem', color:'white' }}>
                            <Card.Img src={source2} alt="Card image" />
                            <Card.ImgOverlay>
                                <Card.Title>Essence of Nature</Card.Title>
                                <Card.Text>
                                Nature's first green is gold, infused in a liquor that will make it truly last forever
                                </Card.Text>
                                <Button variant="primary">Discover</Button>
                            </Card.ImgOverlay>
                        </Card>
                    </CardDeck>
                    </Carousel.Item>
                    <Carousel.Item interval={5000}>
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

