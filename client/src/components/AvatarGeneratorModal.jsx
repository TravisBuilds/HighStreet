import React, { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import WalletProvider from '../contexts/WalletProvider';
import User from '../libs/user';

const AvatarGenerator = () => {
  const [avatarLink, setAvatarLink] = useState('');

  const wallet = useContext(WalletProvider.context);

  const receiveMessage = (event) => {
    if (!avatarLink) {
      if (typeof event.data === 'string') {
        const avatarUrl = event.data;
        setAvatarLink(avatarUrl);
        User.connectMetamask({
          walletAddress: wallet.address,
          avatarUrl
        });
      }
    }
  };

  if (avatarLink !== '') {
    // fetch(`/api/user/${walletAddress}`, {
    //   method: 'POST',
    //   headers: { 'content-type': 'application/json' },
    //   credentials: 'include',
    //   mode: 'cors',
    //   body: JSON.stringify({ avatarLink, googleId: user.googleId })
    // });
  }

  window.addEventListener('message', receiveMessage, false);

  const disableButton = () => {
    const button = document.getElementById('startButton');
    button.style.display = 'none';
  };

  const makeAvatar = () => {
    disableButton();
    let iframe = document.getElementById('iframe');
    if (iframe) {
      iframe.id = 'iframe';
      iframe.src = 'https://lumierevr.readyplayer.me/';
      iframe.className = 'RPMClass';
      iframe.allow = 'camera *; microphone *';
      iframe.contents();
    } else {
      iframe = document.createElement('iframe');
      // console.log(iframe);
      iframe.id = 'iframe';
      iframe.src = 'https://lumierevr.readyplayer.me/';
      iframe.className = 'RPMClass';
      iframe.allow = 'camera *; microphone *';
      console.log(document.querySelector('.RPMClass'));
      document.querySelector('.RPMClass').appendChild(iframe);
      console.log(`ending here${document.querySelector('.RPMClass').appendChild(iframe)}`);
    }
  };

  return (
    <div className="profilePage">
      <p className="page-title" style={{ textAlign: 'center' }}>

        {/* Your Avatar Goes Here */}
      </p>

      <br />
      <Button
        id="startButton"
        variant="outlined"
        color="primary"
        href=""
        style={{ color: 'black', display: 'inline-block', left: '49%' }}
        onClick={makeAvatar}
      >
        Generate
      </Button>

      <div className="RPMClass" />
    </div>
  );
};

export default AvatarGenerator;
