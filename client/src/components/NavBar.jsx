import React, { useContext, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Web3 from 'web3';
import WalletProvider from '../contexts/WalletProvider';
import User from '../libs/user';
import logo from '../assets/lumiere.png';

const NavBar = () => {
  const w = useContext(WalletProvider.context);

  const connectWallet = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(Web3.givenProvider || 'http://localhost:8485');
      console.log('*********');
      try {
        const network = await window.web3.eth.net.getNetworkType();
        // console.log('network:', network);
        const account = await window.web3.eth.getAccounts();
        console.log('account', account[0]);

        User.connectMetamask(account[0], '');
        w.setWallet({ address: account[0] });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('need metamask');
    }
  };

  return (
    <>
      <Navbar bg="light" variant="light">
        <Navbar.Brand href="/">
          <img
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
          />
        </Navbar.Brand>
        <Nav className="ml-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/about">About</Nav.Link>
          <Nav.Link href="/market">Market</Nav.Link>
          {/* <Nav.Link href="/discover">Discover</Nav.Link> */}
          <Nav.Link href="/#downloads">Download</Nav.Link>
        </Nav>

        {w.wallet.address ? (
          <Nav.Link>Wallet: {w.wallet.address.substr(0, 10)}</Nav.Link>
        ) : (
          <Form inline>
            <Button variant="outline-primary" onClick={connectWallet}>Connect Wallet</Button>
          </Form>
        )}
      </Navbar>
    </>
  );
};

export default NavBar;
