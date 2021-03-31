import React, { useState, useCallback } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';

import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'
import { Link } from 'react-router-dom'
import logo from '../assets/lumiere.png'
import TradingCard from '../components/TradingCard'
import BuyButtons from './Buttons.js'
import RedeemButton from './RedeemButton'
// import Checkout from '../components/Checkout'


export const NavBar =() =>{


  return (
  
    <>
    <Navbar bg="light" variant="light">
    <Navbar.Brand href="#home">
      <img
        src={logo}
        width="30"
        height="30"
        className="d-inline-block align-top"
        alt="React Bootstrap logo"
      />
      </Navbar.Brand>
      <Nav className="ml-auto">
        <Nav.Link href="#discover">Home</Nav.Link>
        <Nav.Link href="#about">About</Nav.Link>
        <Nav.Link href="#market">Market</Nav.Link>
        <Nav.Link href="#download">Download</Nav.Link>
      </Nav>
      <Form inline>
        <Button variant="outline-primary">Connect Wallet</Button>
      </Form>
    </Navbar>
  </>

  )


         
}
