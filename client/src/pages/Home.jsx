import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CardDeck from 'react-bootstrap/CardDeck';
import Carousel from 'react-bootstrap/Carousel';
import { useHistory } from 'react-router-dom';
import useInjectedWeb3 from '../components/Hooks/useInjectedWeb3';
import useLoadinjectedEthersState from '../components/Hooks/useLoadInjectedEthersState';

// temp asset import, will remove when datastructure is built
import metamask from '../assets/metamask2.png';
import brands from '../assets/brands.png';
import rpm from '../assets/rpm.png';
import steam from '../assets/steam.png';
import oculus from '../assets/oculus.png';
import metaverse from '../assets/backgroundMetaverse.png';

import { ProductContext } from '../contexts/ProductState';
import { StoreContext } from '../contexts/StoreState';

const Home = () => {
  const history = useHistory();
  const handleClick = (path) => {
    history.push(path);
  };

  const { products } = useContext(ProductContext);
  const { store } = useContext(StoreContext);

  useInjectedWeb3();
  useLoadinjectedEthersState();

  console.log(store.selectedEthAddr);

  return (
    <div className="landing">
      <div id="jumbo">
        <Jumbotron style={{ margin: '0', background: '#4A90E2', color: 'white', }} fluid>
          <Container>
            <Row>
              <Col>
                <p>
                  <strong>Buy, Trade, and Redeem</strong>
                  <br />
                  Limited Edition Products From The Most Exciting Brands
                </p>

                <h1>
                  Virtual Market Place
                  <br />
                  for Redeemable Products
                </h1>
                <div className="mb-2">
                  <div className="loginButton">
                    <Button variant="light">
                      <img src={metamask} alt="metamask" />
                    </Button>

                    <Button variant="outline-light"><img src={brands} alt="brands" /></Button>
                  </div>
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
            {products.reduce(
              (accumulator, currentValue, currentIndex, array) => {
                if (currentIndex % 2 === 0) accumulator.push(array.slice(currentIndex, currentIndex + 2));
                return accumulator;
              }, []
            ).map((p) => (
              <Carousel.Item interval={5000} key={p[0].name}>
                <CardDeck>
                  <Row>
                    <div className="discoverCol">
                      <Col>
                        <Card style={{ width: '30rem', color: 'white' }}>
                          <Card.Img src={p[0].feature} alt="Card image" />
                          <Card.ImgOverlay>
                            <Card.Header style={{ padding: '0', backgroundColor: 'none', border: '0' }}>{p[0].name}</Card.Header>
                            <Card.Title><strong>{p[0].tagline}</strong></Card.Title>
                            <Card.Text>{p[0].blurb}</Card.Text>
                            <br />
                            <br />
                            <Button onClick={() => handleClick('trade')} variant="light" style={{ borderRadius: '50px', width: '8rem' }}><strong>Trade</strong></Button>

                          </Card.ImgOverlay>
                        </Card>
                      </Col>
                    </div>
                    <div className="discoverCol">
                      <Col>
                        <Card style={{ width: '30rem', color: 'white' }}>
                          <Card.Img src={p[1].feature} alt="Card image" />
                          <Card.ImgOverlay>
                            <Card.Header style={{ padding: '0', backgroundColor: 'none', border: '0' }}>{p[1].name}</Card.Header>

                            <Card.Title>{p[1].tagline}</Card.Title>
                            <Card.Text>{p[1].blurb}</Card.Text>
                            <br />
                            <br />
                            <Button onClick={() => handleClick('trade')} style={{ borderRadius: '50px', width: '8rem' }} variant="light"><strong>Trade</strong></Button>

                          </Card.ImgOverlay>
                        </Card>
                      </Col>

                    </div>
                  </Row>
                </CardDeck>
              </Carousel.Item>
            ))}

          </Carousel>
        </Container>
        <Jumbotron style={{ margin: '0', background: '#F6F8F9' }} fluid>
          <Container>
            <div className="title">
              <Row>
                <Col>
                  <h1>Fee Structure </h1>
                </Col>

              </Row>
            </div>
            <div id="feeStruct">
              <br />
              <br />
              <Row>
                <Col>
                  <h3>
                    <i className="fas fa-cube" />
                    <i>&nbsp;&nbsp; $0 for 3D Asset Conversion</i>
                  </h3>
                </Col>
                <Col>
                  <h3>
                    <i className="fab fa-ethereum" />
                    <i> &nbsp;&nbsp;Layer 2 Gasless Minting Coming Soon</i>
                  </h3>
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  <h3>
                    <i className="fas fa-money-check" />
                    <i> &nbsp;&nbsp;4% per Market Sale</i>
                  </h3>
                </Col>
                <Col>
                  <h3>
                    <i className="fas fa-people-arrows" />
                    <i>  &nbsp;&nbsp; 2% per Secondary Transaction</i>
                  </h3>
                </Col>
              </Row>
            </div>
          </Container>
        </Jumbotron>

        <Jumbotron style={{ margin: '0', backgroundImage: `url(${metaverse})` }} fluid>
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

            <div className="dlButtonRow">
              <Row>
                <div className="dlButtons">
                  <Col>
                    <Button variant="dark-light" size="sm">
                      <img src={steam} alt="steam" />
                    </Button>
                  </Col>
                </div>
                <div className="dlButtons">
                  <Col>
                    <Button variant="dark-light" size="sm"><img src={oculus} alt="oculus" /></Button>
                  </Col>
                </div>
              </Row>
            </div>
          </Container>
        </Jumbotron>

        <Jumbotron style={{ margin: '0', background: '#4A90E2', color: 'white' }} fluid>
          <Container>
            <Row>
              <Col />
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
  );
};

export default Home;
