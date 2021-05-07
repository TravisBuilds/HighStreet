import React from 'react';
import tokenomics from '../assets/tokenomics.png';
import '../theme/about.css';

const About = () => (
  <div className="aboutPage">
    <h2>
      Welcome to HighStreet
    </h2>
    <p>
      Highstreet Market is developed by the team at LumiereVR with the goal to become the largest non-gaming section of the decentralized metaverse. Our vision for HighStreet is to be the shopping portal intersecting games and applications built anywhere in the world. Although at it’s current iteration we’ve partnered with HTC and various brands and artists to launch our market place, our goal is to hand the reins to the users eventually and transitioning into a full Decentralized Autonomous Organization (DAO).
    </p>
    <br /><br />
    <p>
      There are two modes to access Highstreet currently, through the metaverse using PCVR and through the website itself. We are not supporting webVR like other decentralized metaverse platforms because we believe that true VR experience is something that cannot be replaced we shouldn’t lower quality for the sake of scale today. HighStreet Market also have two types of users Residents and Merchants, Residents are everyday users logging in with their wallet to buy, trade, and redeem products, whereas Merchants are approved sellers that populate our market place with infinite wonders. Our team will try our best to curate the best products for Residents, but eventually the ecosystem will be able to run itself through token staking process.
    </p>
    <br /><br />
    <p>
      Our market make use of a Proof of Play system of liquidity mining, where to incentivize users to join us in the metaverse, we’ve partnered with HTC’s Viveport platform to provide rewards in Street Tokens to any users that complete certain tasks inside the Metaverse version of our Market Place . To even further incentivize users, any product tokens purchased through depositing our platform are eligible for staking rewards carved out from our transaction fees. A purchase fee of 4% and sell fee of 2% is collected, 1% of pool each goes towards the merchant, 1% of each will go towards our insurance fund, but the final 2 percent from the purchase fee will be allocated as staking rewards.
    </p>

    <img src={tokenomics} alt="tokenomics" />
  </div>
);

export default About;
