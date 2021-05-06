import React, { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import WalletProvider from '../contexts/WalletProvider';
import User from '../libs/user';

const AvatarGenerator = (props) => {
  let avatarUrl;
  const { wallet } = useContext(WalletProvider.context);

  const receiveMessage = (event) => {
    if (typeof event.data === 'string') {
      console.log('************* avatar generated');
      console.log(event.data);
      avatarUrl = event.data;
      User.save({
        email: props.email,
        walletAddress: wallet.address,
        avatarUrl
      });
    }
  };

  // fetch(`/api/user/${wallet.address}`, {
  //   method: 'POST',
  //   headers: { 'content-type': 'application/json' },
  //   credentials: 'include',
  //   mode: 'cors',
  //   body: JSON.stringify({ avatarLink, googleId: user.googleId })
  // });

  window.addEventListener('message', receiveMessage, false);

  useEffect(() => {
    const generatorDiv = document.querySelector('.RPMClass');
    if (!generatorDiv) return;

    let iframe = document.getElementById('iframe');
    if (iframe) {
      iframe.id = 'iframe';
      iframe.src = 'https://lumierevr.readyplayer.me/';
      iframe.className = 'RPMClass';
      iframe.allow = 'camera *; microphone *';
      // iframe.contents();
    } else {
      iframe = document.createElement('iframe');
      iframe.id = 'iframe';
      iframe.src = 'https://lumierevr.readyplayer.me/';
      iframe.className = 'RPMClass';
      iframe.allow = 'camera *; microphone *';
      document.querySelector('.RPMClass').appendChild(iframe);
    }
  });

  return (
    <Modal show={props.show} size="lg" onHide={() => props.close()}>
      <Modal.Header closeButton>
        <Modal.Title>Avatar Generator</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="profilePage">
          <p className="page-title" style={{ textAlign: 'center' }}>
            {/* Your Avatar Goes Here */}
          </p>
          <div className="RPMClass" />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => props.close()}>Close</Button>
        {/* <Button variant="primary">Save changes</Button> */}
      </Modal.Footer>
    </Modal>
  );
};

export default AvatarGenerator;
