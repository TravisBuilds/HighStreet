import React, { useState } from 'react'
import Web3 from 'web3';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CardDeck from 'react-bootstrap/CardDeck';
import Carousel from 'react-bootstrap/Carousel';
import { Router, Route, BrowserRouter, Redirect, Switch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faMoneyCheck, faPeopleArrows } from '@fortawesome/free-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';

//temp asset import, will remove when datastructure is built 
import source1 from '../assets/lvmh.png';
import source2 from '../assets/kalon.png';
import metamask from '../assets/metamask2.png';
import brands from '../assets/brands.png';
import rpm from '../assets/rpm.png';
import steam from '../assets/steam.png';
import oculus from '../assets/oculus.png';
import metaverse from '../assets/backgroundMetaverse.png';
import placeholder from '../assets/placeholderImage.png'

export const Home = () => {

    const placeholderHeader = "Placeholder"
    const placeholderTitle = "This is Placeholder"
    const placeholderText = "Lorem ipsum dolor sit amet, consectetur abore et dolore magna aliqua te"
    const [userAccount, setUserAccount] = useState('');

    window.addEventListener('load', async () => {
        if (window.ethereum) {
            window.web3 = new Web3(Web3.givenprovider || "http://localhost:8485");
            try {
                const network = await window.web3.eth.net.getNetworkType()
                console.log("network, ", network);
                const account = await window.web3.eth.net.getAccount();
                console.log("account", account[0]);
                setUserAccount(account[0]);
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log("need metamask")
        }
    })
    console.log("your Ether Address is, ", { userAccount });
    return (
        <div class="landing" >
            <div id="jumbo">
                <Jumbotron style={{ margin: "0", background: '#4A90E2', color: 'white', }} fluid>
                    <Container>
                        <Row >
                            <Col>
                                <p><strong>Buy, Trade, and Redeem</strong><br></br>Limited Edition Products From The Most Exciting Brands</p>

                                <h1>
                                    The first Virtual Marketplace <br></br>pegged to Real Products
                        </h1>
                                <div className="mb-2">
                                    <p>
                                        <div className="loginButton">
                                            <Button variant="light" > <img src={metamask} /> </Button> {'    '}
                                            <Button variant="outline-light"  ><img src={brands} /></Button>{' '}

                                        </div>
                                    </p>

                                </div>
                            </Col>

                            <div className="shrinkGone">
                                <Col>
                                    <Image src={rpm} height="300px" />
                                </Col>
                            </div>

                        </Row>
                    </Container>
                </Jumbotron>
            </div>
            <div id="Caro">
                <Container>
                    <Carousel>
                        <Carousel.Item interval={5000}>

                            <CardDeck>
                                <Row>
                                    <div class="discoverCol">
                                        <Col>
                                            <Card style={{ width: '30rem', color: 'white' }}>
                                                <Card.Img src={source1} alt="Card image" />
                                                <Card.ImgOverlay>
                                                    <Card.Header style={{padding:"0", backgroundColor:'none', border:'0'}}>LVMH</Card.Header>
                                                    <Card.Title><strong>Making it Real</strong></Card.Title>
                                                    <Card.Text>

                                                        A timeless first and a vibrant way to touch up both your digital and IRL identity
                                                     </Card.Text>
                                                    <br></br>
                                                    <br></br>
                                                    <Button variant="light" style={{borderRadius:"50px", width:"8rem"}}><strong>Discover</strong></Button>
                                                </Card.ImgOverlay>
                                            </Card>

                                        </Col>

                                    </div>

                                    <div class="discoverCol">
                                        <Col>
                                            <Card style={{ width: '30rem', color: 'white' }}>
                                                <Card.Img src={source2} alt="Card image" />
                                                <Card.ImgOverlay>
                                                    <Card.Header style={{padding:"0", backgroundColor:'none', border:'0'}}>Kalon</Card.Header>

                                                    <Card.Title>Essence of Nature</Card.Title>
                                                    <Card.Text>
                                                        Nature's first green is gold, infused in a liquor that will make it truly last forever
                                                    </Card.Text>
                                                    <br></br>
                                                    <br></br>
                                                    <Button style={{borderRadius:"50px", width:"8rem"}} variant="light"><strong>Discover</strong></Button>

                                                </Card.ImgOverlay>
                                            </Card>
                                        </Col>

                                    </div>
                                </Row>
                            </CardDeck>


                        </Carousel.Item>
                        <Carousel.Item interval={5000}>
                            <CardDeck>
                                <Row>
                                    <div class="discoverCol">
                                        <Col>
                                            <Card style={{ width: '30rem', color: 'white' }}>
                                                <Card.Img src={placeholder} alt="Card image" />
                                                <Card.ImgOverlay>
                                                    <Card.Header style={{padding:"0", backgroundColor:'none', border:'0'}}>{placeholderHeader}</Card.Header>
                                                    <Card.Title><strong>{placeholderTitle}</strong></Card.Title>
                                                    <Card.Text>

                                                        {placeholderText}
                                                    </Card.Text>
                                                    <br></br>
                                                    <br></br>
                                                    <Button style={{borderRadius:"50px", width:"8rem"}} variant="light"><strong>Discover</strong></Button>
                                                </Card.ImgOverlay>
                                            </Card>

                                        </Col>

                                    </div>

                                    <div class="discoverCol">
                                        <Col>
                                            <Card style={{ width: '30rem', color: 'white' }}>
                                                <Card.Img src={placeholder} alt="Card image" />
                                                <Card.ImgOverlay>
                                                    <Card.Header style={{padding:"0", backgroundColor:'none', border:'0'}}>{placeholderHeader}</Card.Header>

                                                    <Card.Title>{placeholderTitle}</Card.Title>
                                                    <Card.Text>
                                                        {placeholderText}
                                                    </Card.Text>
                                                    <br></br>
                                                    <br></br>
                                                    <Button style={{borderRadius:"50px", width:"8rem"}} variant="light"><strong>Discover</strong></Button>

                                                </Card.ImgOverlay>
                                            </Card>
                                        </Col>

                                    </div>
                                </Row>
                            </CardDeck>
                        </Carousel.Item>
                        <Carousel.Item interval={5000}>
                            <CardDeck>
                                <Row>
                                    <div class="discoverCol">
                                        <Col>
                                            <Card style={{ width: '30rem', color: 'white' }}>
                                                <Card.Img src={placeholder} alt="Card image" />
                                                <Card.ImgOverlay>
                                                    <Card.Header style={{padding:"0", backgroundColor:'none', border:'0'}}>{placeholderHeader}</Card.Header>
                                                    <Card.Title><strong>{placeholderTitle}</strong></Card.Title>
                                                    <Card.Text>

                                                        {placeholderText}
                                                    </Card.Text>
                                                    <br></br>
                                                    <br></br>
                                                    <Button  style={{borderRadius:"50px", width:"8rem"}} variant="light"><strong>Discover</strong></Button>
                                                </Card.ImgOverlay>
                                            </Card>

                                        </Col>

                                    </div>

                                    <div class="discoverCol">
                                        <Col>
                                            <Card style={{ width: '30rem', color: 'white' }}>
                                                <Card.Img src={placeholder} alt="Card image" />
                                                <Card.ImgOverlay>
                                                    <Card.Header style={{padding:"0", backgroundColor:'none', border:'0'}}>{placeholderHeader}</Card.Header>

                                                    <Card.Title>{placeholderTitle}</Card.Title>
                                                    <Card.Text>
                                                        {placeholderText}
                                                    </Card.Text>
                                                    <br></br>
                                                    <br></br>
                                                    <Button style={{borderRadius:"50px", width:"8rem"}} variant="light"><strong>Discover</strong></Button>

                                                </Card.ImgOverlay>
                                            </Card>
                                        </Col>

                                    </div>
                                </Row>
                            </CardDeck>
                        </Carousel.Item>

                    </Carousel>
                </Container>
                <Jumbotron style={{ margin: "0", background: "#F6F8F9" }} fluid>
                    <Container>
                        <div className="title">
                            <Row>
                                <Col>
                                    <h1>Fee Structure </h1>
                                </Col>

                            </Row>
                        </div>
                        <div id="feeStruct">
                            <br></br>
                            <br></br>
                            <Row>
                                <Col><h3><FontAwesomeIcon icon={faCube} /><i>&nbsp;&nbsp; $0 for 3D Asset Conversion</i></h3></Col>
                                <Col><h3><FontAwesomeIcon icon={faEthereum} /><i> &nbsp;&nbsp;Layer 2 Gasless Minting Coming Soon</i></h3></Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Col><h3><FontAwesomeIcon icon={faMoneyCheck} /><i> &nbsp;&nbsp;4% per Market Sale</i></h3></Col>
                                <Col><h3><FontAwesomeIcon icon={faPeopleArrows} /><i>  &nbsp;&nbsp; 2% per Secondary Transaction</i></h3></Col>
                            </Row>
                        </div>
                    </Container>

                </Jumbotron>

                <Jumbotron style={{ margin: "0", backgroundImage: `url(${metaverse})` }} fluid>
                    <Container>
                        
                        <div className="title2" id="downloads">
                            <Row>
                                <Col>
                                    <h1>Explore Our Metaverse with Friends </h1>
                                    <div id="subtitle">
                                        <h3><i>Virtual Stores from Real Brands are populated across Multiple Zones</i></h3>
                                    </div>
                                </Col>

                            </Row>
                        </div>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>

                        <div class="dlButtonRow">
                            <Row>
                                <div class="dlButtons">
                                    <Col><Button variant="dark-light" size="sm"> <img src={steam} /> </Button> {'  '}</Col>
                                </div>
                                <div class="dlButtons">
                                    <Col><Button variant="dark-light" size="sm" ><img src={oculus} /></Button>{' '}</Col>
                                </div>
                            </Row>
                        </div>

                    </Container>

                </Jumbotron>
                <Jumbotron style={{ margin: '0', background: '#4A90E2', color: 'white' }} fluid>
                    <Container>
                        <Row>
                            <Col></Col>
                            <Col md="auto">Documentation</Col>
                            <Col xs lg="2">Terms and Conditions</Col>
                        </Row>

                        <Row>
                            <Col>Merging the digital world with the real world.</Col>
                            <Col md="auto">Token Management</Col>
                            <Col xs lg="2">Blog</Col>
                        </Row>

                        <Row>
                            <Col>Discover, Buy, Trade, and redeem tokens from great brands around the world.</Col>
                            <Col md="auto">Market</Col>
                            <Col xs lg="2">Contact Us</Col>
                        </Row>

                    </Container>
                </Jumbotron>
            </div>
        </div>
    )

}

