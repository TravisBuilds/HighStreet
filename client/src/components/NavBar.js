import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'
import { Link } from 'react-router-dom'
import logo from '../assets/lumiere.png'

import { useAppContext } from '../contexts/'
import TradingCard from '../components/TradingCard'
import BuyButtons from './Buttons.js'
import RedeemButton from './RedeemButton'
// import Checkout from '../components/Checkout'


export const NavBar =() =>{


  return (
    <HeaderFrame>
      <link to="/" style={{textDecoration: 'none', display: 'flex', alignItems: 'center'}}>
        <logo>
          <span>
            <img
            src={logo} 
            alt="logo"
            style={{}}
            />
          </span> 
        </logo>
      </link>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Link to = "/discover" style= {{textDecoration : 'none'}}>
          Discover 
        </Link>

        <Link to = "/discover" style= {{textDecoration : 'none'}}>
          About 
        </Link>

        <Link to = "/discover" style= {{textDecoration : 'none'}}>
          Market 
        </Link>

        <Link to = "/discover" style= {{textDecoration : 'none'}}>
          Download
        </Link>


        
      </div>

    </HeaderFrame>
  )


         
}

const HeaderFrame = styled.div`
  position: fixed;
  width: 100%;
  box-sizing: border-box;
  margin: 0px;
  font-size: 1.25rem;
  color: ${props => (props.balanceSOCKS ? props.theme.primary : 'white')};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem;
`

const Account = styled.div`
  background-color: ${props => (props.balanceSOCKS ? '#f1f2f6' : props.theme.blue)};
  padding: 0.75rem;
  border-radius: 6px;
  cursor: ${props => (props.balanceSOCKS ? 'auto' : 'pointer')};
  transform: scale(1);
  transition: transform 0.3s ease;
  :hover {
    transform: ${props => (props.balanceSOCKS ? 'scale(1)' : 'scale(1.02)')};
    text-decoration: underline;
  }
`

const Burned = styled.div`
  background-color: none;
  border: 1px solid red;
  margin-right: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transform: scale(1);
  transition: transform 0.3s ease;
  line-height: 1;
  :hover {
    transform: scale(1.02);
  }
  font-weight: 500;
  font-size: 14px;
  color: red;
`

const HideMobile = styled.span`
  @media only screen and (max-width: 480px) {
    display: none;
  }
`

const SockCount = styled.p`
  /* color: #6c7284; */
  font-weight: 500;
  margin: 0px;
  font-size: 14px;
  float: left;
`

const Status = styled.div`
  display: ${props => (props.balanceSOCKS ? 'initial' : 'none')};
  width: 12px;
  height: 12px;
  border-radius: 100%;
  margin-left: 12px;
  margin-top: 2px;
  float: right;
  background-color: ${props =>
    props.account === null ? props.theme.orange : props.ready ? props.theme.green : props.theme.orange};
  // props.account === null ? props.theme.orange : props.theme.green};
`
