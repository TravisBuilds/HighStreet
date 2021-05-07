import React, { useContext, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import WalletProvider from '../contexts/WalletProvider';
import User from '../libs/user';
import logo from '../assets/logoH.png';

const NavBar = () => {
  const context = useContext(WalletProvider.context);

  return (
    <>
      <Navbar>
        <Navbar.Brand href="/">
          <img
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
          />
          <span className="logo-text">ighStreet.Market</span>
        </Navbar.Brand>
        <Nav className="ml-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/about">About</Nav.Link>
          <Nav.Link href="/coming-soon">Market</Nav.Link>
          {/* <Nav.Link href="/market">Market</Nav.Link> */}
          {/* <Nav.Link href="/discover">Discover</Nav.Link> */}
          {/* <Nav.Link href="/#downloads">Download</Nav.Link> */}
        </Nav>

        {context.wallet.address ? (
          <Nav.Link>Wallet: {context.wallet.address.substr(0, 10)}</Nav.Link>
        ) : (
          <Form inline>
            <Button variant="outline-primary" onClick={() => User.connectWallet(context)}>Connect Wallet</Button>
          </Form>
        )}
      </Navbar>
    </>
  );
};

export default NavBar;
