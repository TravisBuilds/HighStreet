# Abstract 
## Bringing DEFI concepts to Real Products  
### Inspiration 
On May 9th 2019, the Uniswap team announced Unisocks($SOCKS) at the Fluidity Summit in NYC. Although Unisocks wouldn't be the first product represented on the Ethereum blockchain by Tokens, it would be the first to allow every token to be redeemable for a pair of actual SOCKS in real life. Since only 500 tokens will ever exist, every SOCKS sold increases the price of the next. Following a bonding curve to govern it's price, Unisocks tokens can be sold back to the liquidity pool at any time. 
[![socks](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/socks.png?raw=true "socks")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/socks.png?raw=true "socks")

### Marketplace for Limited Edition Products
Although Unisocks was launched as a proof of concept for a decentralized exchange, it demonstrated a viable path to disrupting the way physical goods are released. From a Luxury Brand's new line of apparel to VIP Concert Tickets, Fine Dining Restaurant Reservation to Small Batch Wine and Whisky sales, any limited edition product can be sold on a bonding curve. As such, our team has taken it upon ourselves to build exactly that, a marketplace on the ethereum blockchain for high end brands to launch their limited edition products. 

# Market Maker and Price Discovery of Products 
## Why Would Brands Want This? 
Brands like Nike or Supreme periodically drop limited edition products, however majority of the product's value kick in after the drop in secondary markets. These markets are often plagued with fraud and are a logistical nightmare for all parties involved. Token based rollout strategy will allow brands to not only capture part of the resale value of their products but also protect them from malicious 3rd parties. 

## Bonding Curve based Price Discovery 
Bonding Curves were made popular by DEFI platforms like Uniswap, Aave, and Bancor in order to ensure liquidity and remove the need for traditional market makers like in centralized orderbook based exchanges. Bonding Curves use a pricing algorithm that serve as the Automated Market Maker (AMM) so buyers and sellers of our product tokens can always ensure that there's someone on the other side to trade with. 

For our product tokens, first a user can stake tokens into the bonding curve's reserve pool, by doing so product tokens are minted for the user based on the pricing algorithm. When a token is purchased this way, every subsequent token will increase in price, meaning early buyers are rewarded as they can now sell their now tokens back for a profit. 

## Formula 
Although there are many bonding curve formulas out there, we are adopting the Bancor Formula 
[![bancor](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/bancor.png?raw=true "bancor")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/bancor.png?raw=true "bancor")

- **Reserve Token** refers to the token that is users initially stake into the bonding curve
- **Continuous Token** is the product token received once **Reserve Tokens** are staked 
- **Reserve Ratio** is a fixed ratio from 0 to 1 between the **Continuous Token's** market cap and the value of the **Reserve Token** Balance.
- Since the **Reserve Ratio** is directly related to price sensitivity, this ratio will vary depending on the type of product being minted

Every buy and sell moves the Reserve Token Balance and Continuous Token Market cap, so in order to maintain our Reserve Ratio, the price of the Continuous(Product) Token will be continuously recalculated.

## Whale Alert 
coming soon 

# Staking Yield and Token Utilities 

## Membership
Membership is a right earned by staking our platform token. Platform token utility includes the right to purchase product tokens, as well as the right to governance once our platform transitions into a full DAO.  

## Governance 
Owning platform token enable users to participate in the governance process through a decentralized organization, with proposals and voting structures. They are also able to vote on issues related to operations and how to streamline and onboard future products. 

## Staking Yield 
Staking incentives are our way of creating monetary and governance incentives for our most commited members. Based on our staking and reward projections. Liquidity providers for our platform token will have product tokens allocated to them everytime a new product is dropped. A portion of platform tokens are also reserved for early stakers, this incentivize stakers to hold their tokens while the market is maturing and new brands and shops are being added. Staking rewards will decrease as platform becomes self sustaining. 


[![allocation](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/whiteal.png?raw=true "allocation")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/whiteal.png?raw=true "allocation")

## Distribution
coming soon 

# Tech Breakdown 
## Backend: Ethereum/Solidity 
Smart contracts written in solidity are forked from credible projects like Uniswap. 

## Frontend: Web and VR
The DAO interface will be a web application built on React and wrapped with web3JS. Buying, Trading, and Redemption of tokens can be performed on the web app interface. Redeeming a product token will send it to address 0, effectively burning it and removing it from circulation forever. 

[![sample](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/sample.png?raw=true "sample")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/sample.png?raw=true "sample")

The virutal market extension built in Unity is also fully accessible on PC and Stand Alone VR platforms. It act as a a completely interactive metaverse for user to buy, trade, and redeem tokens in a more social enviornment. Every brand and product along with their associated token can be bought at Virtual Shops. Bigger brands will have more custom user experiences built into their stores depending on their partnership with us. All user tokens will be represented as interactive 3D objects once logged into our Virtual Market. We are working to include support for external tokens as well, for example a user with cryptokitties in their metamask wallet will have their PNG file converted to a completely rigged and animated 3D model. 

[![market](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/market.png?raw=true "market")](http://https://github.com/TravisBuilds/virtualmarket/blob/master/resources/market.png?raw=true "market")
 
## Features
We believe the future home of digital assets will most certainly be in Virtual Reality. We are building the shopping component of the shared metaverse. 
[![feature](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/feature.png?raw=true "feature")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/feature.png?raw=true "feature")

# Investors and Partners 
### As leading innovators in the digital space since 2015, we've established strong investor relations as well as brand partnerships with Tier One companies

[![partnerships](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/backing.png?raw=true "partnerships")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/backing.png?raw=true "partnerships")

## Launch Product Lineups 
[![launch](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/launch.png?raw=true "launch")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/launch.png?raw=true "launch")



