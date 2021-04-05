import React, { useContext, useState } from 'react'
import Web3 from 'web3';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Tilt from 'react-tilt';

import { ProductContext} from "../contexts/ProductState";
import kalonCard from "../assets/product1.png";

export const TradeCard = (props) => {
    const [userAccount, setUserAccount] = useState(null);
    const [buyButtonText, setBuyButtonText] = useState("Connect Wallet")

    window.addEventListener('load', async () => {
        if (window.ethereum) {
            window.web3 = new Web3(Web3.givenprovider || "http://localhost:8485");
            try {
                const network = await window.web3.eth.net.getNetworkType()
                console.log("network, ", network);
                const account = await window.web3.eth.net.getAccount();
                console.log("account", account[0]);
                setUserAccount(account[0]);
                setBuyButtonText("Buy")
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log("need metamask")
        }
    })
    console.log("your Ether Address is, ", { userAccount });

    
    // placeholder
    const myProduct =
    {
        name: "Kalon Tea",
        ticker: "KLT",
        price: 12,
        supply: 500,
        availale:500,
        img: kalonCard
    }

    const { products } = useContext(ProductContext)
    const {tokenBought} = useContext(ProductContext); 
    console.log(products)

    console.log("here are props")
    console.log(props)

    const myProductx = products.find(product => product.name == props.active);
    console.log("loggign", myProductx)


    return (

        <div style={props.style}>
            <Jumbotron className="cardJumbo" style={{ margin: "0", background: '#0E0E0E', zIndex: "-1" }} fluid>
                <Container style={{ width: "25rem", margin: "auto" }}>
                    <Row>
                        <Col>
                            <Card className="bg-dark text-white" style={{ border: "none" }}>
                                <Card.Body style={{ backgroundColor: 'white', padding: "0" }}>
                                    <Card.Img style={{ margin: "none", padding: "none" }} src={myProduct.img}></Card.Img>
                                    <Card.ImgOverlay>
                                        <Card.Header style={{ padding: "0", backgroundColor: 'none', border: '0' }}><strong>{myProduct.name}</strong></Card.Header>
                                        <Card.Title>{myProduct.ticker}</Card.Title>
                                        <br></br>  <br></br>  <br></br>  <br></br><br></br> <br></br> <br></br>  <br></br>  <br></br> <br></br><br></br>   <br></br>
                                        <Card.Text style={{ margin: "0" }}><h3>{myProduct.price}&nbsp;USD </h3></Card.Text>
                                        <Card.Footer style={{ padding: "0", backgroundColor: 'none', border: '0' }}>{myProduct.available}&nbsp;out of {myProduct.supply}&nbsp;stocks available</Card.Footer>
                                    </Card.ImgOverlay>
                                    <div className="dropDown" >
                                        <DropdownButton variant="secondary" title={`${myProduct.price} DAI`} style={{background:"#f1f2f6", width: "20rem", marginTop: "8px", marginBottom: "8px", marginLeft: "1.5rem" }}>
                                            <Dropdown.Item as="button">{myProduct.price} DAI</Dropdown.Item>
                                            <Dropdown.Item as="button">ETH</Dropdown.Item>
                                            <Dropdown.Item as="button">BAT</Dropdown.Item>
                                            <Dropdown.Item as="button">XXX</Dropdown.Item>
                                        </DropdownButton>
                                    </div>
                                    <Col>
                                    <div className="curvyButton">
                                        <Button variant="primary" style={{ background: "#4A90E2", width: "20rem", marginTop: "8px", marginBottom: "8px", marginLeft: "0.5rem" }}
                                            onClick={()=> tokenBought(myProduct.name)}
                                        ><strong>{buyButtonText}</strong></Button> {''}
                                    </div>
                                    </Col>
                                    
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Jumbotron>
        </div>
    )
}
