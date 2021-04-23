import React, { useState, useEffect } from 'react';
import { useWeb3Context } from 'web3-react';
import { ethers } from 'ethers';
import styled from 'styled-components';

export default function Web3ReactManager({ children }) {
  const { setConnector, error, active } = useWeb3Context();

  // initialization management
  useEffect(() => {
    if (!active) {
      if (window.ethereum) {
        try {
          const library = new ethers.providers.Web3Provider(window.ethereum);
          library.listAccounts().then((accounts) => {
            if (accounts.length >= 1) {
              setConnector('Injected', { suppressAndThrowErrors: true });
            } else {
              setConnector('Network');
            }
          });
        } catch (e) {
          setConnector('Network');
        }
      } else {
        setConnector('Network');
      }
    }
  }, [active, setConnector]);

  const [showLoader, setShowLoader] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 750);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (error) {
    console.error(error);
    return <Message>Connection Error.</Message>;
  } if (!active) {
    return showLoader ? <Message>Initializing...</Message> : null;
  }
  return children;
}

const Message = styled.h1`text-align: center; color: ${(props) => props.theme.lumiereBlue};`;
