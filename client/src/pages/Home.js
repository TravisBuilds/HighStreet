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
                <Jumbotron style={{ background: '#87ceeb' }}>
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
                    <Carousel.Item interval={5000}>
                    <CardDeck>
                    <Card style={{ width: '30rem' }}>
                        <Card.Img variant="top" src={source1} />
                        <Card.Body>
                            <Card.Title>Making it Real</Card.Title>
                            <Card.Text>
                            A timeless first and a vibrant way to touch up both your digital and IRL identity
                            </Card.Text>
                            <Button variant="primary">Discover</Button>
                        </Card.Body>
                        </Card>

                        <Card style={{ width: '30rem' }}>
                        <Card.Img variant="top" src={source2} />
                        <Card.Body>
                            <Card.Title> Essence of Nature</Card.Title>
                            <Card.Text>
                            Nature's first green is gold, infused in a liquor that will make it truly last forever
                            </Card.Text>
                            <Button variant="primary">Discover</Button>
                        </Card.Body>
                        </Card>
                        </CardDeck>
                    </Carousel.Item>
                    <Carousel.Item interval={5000}>
                    <CardDeck>
                    <Card style={{ width: '30rem' }}>
                        <Card.Img variant="top" src={source1} />
                        <Card.Body>
                            <Card.Title>Making it Real</Card.Title>
                            <Card.Text>
                            A timeless first and a vibrant way to touch up both your digital and IRL identity
                            </Card.Text>
                            <Button variant="primary">Discover</Button>
                        </Card.Body>
                        </Card>

                        <Card style={{ width: '30rem' }}>
                        <Card.Img variant="top" src={source2} />
                        <Card.Body>
                            <Card.Title> Essence of Nature</Card.Title>
                            <Card.Text>
                            Nature's first green is gold, infused in a liquor that will make it truly last forever
                            </Card.Text>
                            <Button variant="primary">Discover</Button>
                        </Card.Body>
                        </Card>
                        </CardDeck>
                    </Carousel.Item>
                    <Carousel.Item>
                    <CardDeck>
                    <Card style={{ width: '30rem' }}>
                        <Card.Img variant="top" src={source1} />
                        <Card.Body>
                            <Card.Title>Making it Real</Card.Title>
                            <Card.Text>
                            A timeless first and a vibrant way to touch up both your digital and IRL identity
                            </Card.Text>
                            <Button variant="primary">Discover</Button>
                        </Card.Body>
                        </Card>

                        <Card style={{ width: '30rem' }}>
                        <Card.Img variant="top" src={source2} />
                        <Card.Body>
                            <Card.Title> Essence of Nature</Card.Title>
                            <Card.Text>
                            Nature's first green is gold, infused in a liquor that will make it truly last forever
                            </Card.Text>
                            <Button variant="primary">Discover</Button>
                        </Card.Body>
                        </Card>
                        </CardDeck>
                    </Carousel.Item>
                </Carousel>
            </div>
        </div>
    )
    
}

