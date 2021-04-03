import React, { useContext } from 'react'
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

import { ProductContext, ProductProvider } from "../contexts/ProductState";

//this will be replaced eventually 
const productList = [

]
export const Trade = () => {

    const { products } = useContext(ProductContext)

    return (
        <div>
            {/* here are some products 
            <ul className="products"> 
            {products.map(product => (<li><img className = "ticker" 
                src= {product.img}
            /></li>))}
            
            </ul>  */}
            <Carousel>
                {products.map(product => (
                    <Carousel.Item style={{ width: '18rem' }} >
                        <Container>
                            <Row>
                                <Col>
                                <Card className="bg-dark text-white"  interval={null}>
                                    <Card.Img src={product.img}></Card.Img>
                                    <Card.ImgOverlay>
                                        <Card.Header>{product.name}</Card.Header>
                                        <Card.Title>{product.ticker}</Card.Title>
                                        <Card.Text>{product.price}</Card.Text>
                                        <Card.Footer>{product.supply}</Card.Footer>
                                    </Card.ImgOverlay>
                                </Card>
                                </Col>
                            </Row>
                            
                            <Row>
                            <Col>
                            <div className="curvyButton">
                            <Button variant="primary" style={{width:"18rem"}}>Buy</Button> {'    '}
                            </div>
                            </Col>
                            </Row>
                            
                            <Row>
                            <Col>
                            <div className="curvyButton">
                            <Button variant="secondary" >Sell</Button> {' '}
                            </div>
                            </Col>
                            <Col>
                            <div className="curvyButton">
                            <Button variant="secondary">Redeem</Button> {' '}
                            </div>
                            </Col>
                            </Row>
                        </Container>

                    </Carousel.Item>

                )


                )}

            </Carousel>

            {/* <Card className="bg-dark text-white" style={{ width: '18rem' }}>
                <Card.Img src={products[0].img}/>
                <Card.ImgOverlay>
                    <Card.Header>{products[0].name}</Card.Header>
                    <Card.Title>{products[0].ticker}</Card.Title>
                    <Card.Text>{products[0].price}</Card.Text>
                    <Card.Footer>{products[0].supply}</Card.Footer>
                </Card.ImgOverlay>
            </Card> */}
        </div>
    )
}
