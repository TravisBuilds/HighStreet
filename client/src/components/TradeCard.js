import React, { useContext, useState } from 'react'
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
import Tilt from 'react-tilt';
import kalonCard from '../assets/product1.png';



export const TradeCard = ({ style }) => {

    //placeholder
    const product = 
    {
        name: "Kalon Tea",
        ticker: "KLT", 
        price: 12,
        supply: 500,
        img: kalonCard
    }
    return (

        <div style={style}>
            <Jumbotron className="cardJumbo" style={{ margin: "0", background: '#CCDAF5' }} fluid>
                <Container style={{ width: "25rem", margin: "auto" }}>
                    <Row>
                        <Col>
                            <Card className="bg-dark text-white" style={{ border: "none", zIndex:"15"}}>
                                <Card.Img src={product.img}></Card.Img>
                                <Card.ImgOverlay>
                                    <Card.Header style={{ padding: "0", backgroundColor: 'none', border: '0' }}><strong>{product.name}</strong></Card.Header>
                                    <Card.Title>{product.ticker}</Card.Title>
                                    <br></br>  <br></br>  <br></br>  <br></br><br></br> <br></br> <br></br>  <br></br>  <br></br> <br></br><br></br>   <br></br>
                                    <Card.Text style={{ margin: "0" }}><h3>{product.price}&nbsp;USD </h3></Card.Text>
                                    <Card.Footer style={{ padding: "0", backgroundColor: 'none', border: '0' }}>{product.supply}&nbsp;stocks available</Card.Footer>
                                </Card.ImgOverlay>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Jumbotron>
        </div>
    )
}
