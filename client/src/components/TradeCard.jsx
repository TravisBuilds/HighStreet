import React, { useContext, useState, useEffect } from 'react';

import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ProductProvider from '../contexts/ProductProvider';
import kalonCard from '../assets/product1.png';

const TradeCard = (props) => {
  // change here
  const [
    buyButtonText
    // , setBuyButtonText
  ] = useState('Connect Wallet');

  // placeholder
  const [myProduct, setMyProduct] = useState({
    name: 'Kalon Tea',
    ticker: 'KLT',
    price: 12,
    supply: 500,
    available: 500,
    img: kalonCard
  });

  const { products, tokenBought } = useContext(ProductProvider.context);

  useEffect(() => {
    if (props.active !== undefined) {
      const myProductX = products.find((product) => (product.name === props.active ? product : null));
      setMyProduct(myProductX);
    }
  }, [props]);

  const deactivate = () => {
    props.onChange('none');
  };

  return (
    <div style={props.style}>
      <Jumbotron className="cardJumbo" style={{ margin: '0', background: '#0E0E0E', zIndex: '-1' }} fluid>
        <Container style={{ width: '25rem', margin: 'auto' }}>
          <Row>
            <Col>
              <Card className="bg-dark text-white" style={{ border: 'none' }}>
                <Card.Body style={{ backgroundColor: 'white', padding: '0' }}>
                  <Card.Img style={{ margin: 'none', padding: 'none' }} src={myProduct.img} />
                  <Card.ImgOverlay>
                    <Card.Header style={{ padding: '0', backgroundColor: 'none', border: '0' }}><strong>{myProduct.name}</strong></Card.Header>
                    <Card.Title>{myProduct.ticker}</Card.Title>

                    <Card.Text style={{ margin: '0' }}>
                      <h3>
                        {myProduct.price.toFixed(4)}
&nbsp;USD
                        {' '}
                      </h3>
                    </Card.Text>
                    <Card.Footer style={{ padding: '0', backgroundColor: 'none', border: '0' }}>
                      {myProduct.available}
                      {' '}
                      out of
                      {' '}
                      {myProduct.supply}
&nbsp;stocks available
                    </Card.Footer>
                  </Card.ImgOverlay>
                  <div className="dropDown">
                    <DropdownButton variant="secondary" title={`${myProduct.price.toFixed(4)} DAI`} style={{ background: '#f1f2f6', width: '20rem', marginTop: '8px', marginBottom: '8px', marginLeft: '1.5rem' }}>
                      <Dropdown.Item as="button">
                        {myProduct.price.toFixed(4)}
                        {' '}
                        DAI
                      </Dropdown.Item>
                      <Dropdown.Item as="button">ETH</Dropdown.Item>
                      <Dropdown.Item as="button">BAT</Dropdown.Item>
                      <Dropdown.Item as="button">XXX</Dropdown.Item>
                    </DropdownButton>
                  </div>
                  <Col>
                    <div className="curvyButton">
                      <Button
                        variant="primary"
                        style={{ background: '#4A90E2', width: '20rem', marginTop: '8px', marginBottom: '8px', marginLeft: '0.5rem' }}
                        onClick={() => tokenBought(myProduct.name)}
                      >
                        <strong>{buyButtonText}</strong>
                      </Button>
                      {' '}

                    </div>
                  </Col>
                  <Col>
                    <div className="curvyButton">
                      <Button
                        variant="primary"
                        style={{ background: '#F6BABA', width: '20rem', marginTop: '8px', marginBottom: '8px', marginLeft: '0.5rem' }}
                        onClick={() => deactivate()}
                      >
                        <strong>cancel</strong>
                      </Button>
                      {' '}

                    </div>
                  </Col>

                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Jumbotron>
    </div>
  );
};

export default TradeCard;
