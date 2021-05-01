import React, { useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import UserContext from '../contexts/UserState';
import logo from '../assets/lumiere.png';

const NavBar = () => {
  const user = useContext(UserContext);

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
        {user ? (
          <h3>Wallet: {user}</h3>
        ) : (
          <Form inline>
            <Button variant="outline-primary">Connect Wallet</Button>
          </Form>
        )}
      </Navbar>
    </>
  );
};

export default NavBar;
