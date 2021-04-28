// import React, { useContext, useState } from 'react';
// import _ from 'lodash';
// import Button from '@material-ui/core/Button';
// import { UserProvider } from '../contexts/UserProvider';

// const addingURL = () => { };
// const LoginMsg = 'Nothing has been created yet';

// export const Profile = ({ children, ...props }) => {
//   const [avatarLink, setAvatarLink] = useState('');

//   const user = useContext(UserProvider.context);

//   const receiveMessage = (event) => {
//     if (!avatarLink) {
//       if (typeof event.data === 'string') {
//         setAvatarLink(event.data);
//         console.log(event.data);
//       }
//     }
//   };
//   if (avatarLink != '') {
//     console.log('user exists here');
//     console.log(user);
//     fetch('/user/userurl', {
//       method: 'POST',
//       headers: { 'content-type': 'application/json' },
//       credentials: 'include',
//       mode: 'cors',
//       body: JSON.stringify({ avatarLink, googleId: user.googleId })
//     });
//   }

//   window.addEventListener('message', receiveMessage, false);

//   const disableButton = () => {
//     const button = document.getElementById('startButton');
//     button.style.display = 'none';
//   };
//   const makeAvatar = () => {
//     console.log('got here');
//     disableButton();
//     let iframe = document.getElementById('iframe');
//     if (iframe) {
//       iframe.id = 'iframe';
//       iframe.src = 'https://lumierevr.readyplayer.me/';
//       iframe.className = 'RPMClass';
//       iframe.allow = 'camera *; microphone *';
//       iframe.contents();
//     } else {
//       iframe = document.createElement('iframe');
//       console.log(iframe);
//       iframe.id = 'iframe';
//       iframe.src = 'https://lumierevr.readyplayer.me/';
//       iframe.className = 'RPMClass';
//       iframe.allow = 'camera *; microphone *';
//       console.log(document.querySelector('.RPMClass'));
//       document.querySelector('.RPMClass').appendChild(iframe);
//       console.log(`ending here${document.querySelector('.RPMClass').appendChild(iframe)}`);
//     }
//   };

//   return (
//     // <div className="page">
//     <div className="profilePage">
//       <p className="page-title" style={{ textAlign: 'center' }}>

//         {/* Your Avatar Goes Here */}
//       </p>

//       <br />
//       <Button
//         id="startButton"
//         variant="outlined"
//         color="primary"
//         href=""
//         style={{ color: 'black', display: 'inline-block', left: '49%' }}
//         onClick={makeAvatar}
//       >
//         Generate
//       </Button>

//       <div className="RPMClass" />
//     </div>
//   );
// };
