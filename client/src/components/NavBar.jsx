import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';

import logo from '../assets/lumiere.png';

const NavBar = () => (
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
        <Nav.Link href="/Discover">Discover</Nav.Link>
        <Nav.Link href="/Profile">Profile</Nav.Link>
        <Nav.Link href="/#downloads">Download</Nav.Link>
      </Nav>
      <Form inline>
        <Button variant="outline-primary">Connect Wallet</Button>
        <Button variant="outline-primary" onClick={() => { window.location.href = '/auth/instagram'; }}>Instagram Login</Button>
      </Form>
    </Navbar>
  </>
);

export default NavBar;
