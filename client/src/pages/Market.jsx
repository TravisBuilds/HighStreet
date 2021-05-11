import React, { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Carousel from 'react-bootstrap/Carousel';
import Tilt from 'react-tilt';
import TradeCard from '../components/TradeCard';
import ProductProvider from '../contexts/ProductProvider';

const Market = () => {
  const [active, setActive] = useState('none');
  const [
    buttonDisabled
    // , setButtonDisabled
  ] = useState(false);

  const deactivate = () => {
    setActive('none');
  };

  console.log('this is active', active);
  const cart = active !== 'none' ? (
    <TradeCard onChange={deactivate} active={active} style={{ zIndex: '10', position: 'fixed', top: '0px', width: '100vw', height: '100vh' }} />
  ) : (
    <TradeCard style={{ display: 'none' }} />
  );

  const { products, tokenPrice, tokenAvailablity, tokenBuy, tokenSell, tokenRedeem } = useContext(ProductProvider.context);
  // products.map( product =>{
  //     if (product.supply === product.available){
  //         setButtonDisabled(true)
  //     }
  // })
  console.log('here are the current states', products);
  return (
    <div>
      {cart}
      <Jumbotron className="cardJumbo" style={{ margin: '0', height: '100vh' }} fluid>
        <Carousel fade interval={null} indicators={false}>
          {products.map((product) => (
            <Carousel.Item style={{ width: '25rem' }} key={product.name}>
              <Container style={{ margin: 'auto' }}>
                <Row>
                  <Col>
                    <Tilt
                      style={{ borderRadius: '8px' }}
                      options={{ scale: 1.01, max: 10, glare: true, 'max-glare': 1, speed: 1000 }}
                    >
                      <Card className="bg-dark text-white" style={{ border: 'none' }}>
                        <Card.Img src={product.img} />
                        <Card.ImgOverlay>
                          <Card.Header style={{ padding: '0', backgroundColor: 'none', border: '0' }}><strong>{product.name}</strong></Card.Header>
                          <Card.Title>{product.ticker}</Card.Title>
                          <Card.Text style={{ margin: '0' }}>
                            <h3>
                              {tokenPrice(product)}
                              {' '}
                              USD
                            </h3>
                          </Card.Text>
                          <Card.Footer style={{ padding: '0', border: '0' }}>
                            {tokenAvailablity(product.ticker)}
                            {' '}
                            out of
                            {product.supply}
                            {' '}
                            stocks available
                          </Card.Footer>
                        </Card.ImgOverlay>
                      </Card>
                    </Tilt>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <div className="curvyButton">
                      <Button
                        variant="primary"
                        style={{ width: '23rem', marginTop: '8px', marginBottom: '8px' }}
                        onClick={() => tokenBuy(product.ticker)}
                        disabled={buttonDisabled}
                      >
                        <strong>Buy</strong>
                      </Button>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <div className="curvyButton">
                      <Button
                        variant="secondary"
                        style={{ width: '10.6rem' }}
                        onClick={() => tokenSell(product.ticker)}
                        disabled={buttonDisabled}
                      >
                        <strong>Sell</strong>
                      </Button>
                    </div>
                  </Col>
                  <Col>
                    <div className="curvyButton">
                      <Button
                        variant="secondary"
                        style={{ width: '10.6rem' }}
                        onClick={() => tokenRedeem(product.ticker)}
                        disabled={buttonDisabled}
                      >
                        <strong>Redeem</strong>
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Container>
            </Carousel.Item>
          ))}
        </Carousel>
      </Jumbotron>
    </div>
  );
};

export default Market;
