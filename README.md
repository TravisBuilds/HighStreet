# Highstreet.Market
## A Market Place for Redeemable Limited Edition Products

# Abstract 
## Bringing DEFI concepts to Real Products  
### Inspiration 
On May 9th 2019, the Uniswap team announced Unisocks($SOCKS) at the Fluidity Summit in NYC. Although Unisocks wouldn't be the first product represented on the Ethereum blockchain by Tokens, it would be the first to allow every token to be redeemable for a pair of actual SOCKS in real life. Since only 500 tokens will ever exist, every SOCKS sold increases the price of the next one. Following a bonding curve to govern it's price, Unisocks tokens can be sold back to the liquidity pool at any time. 
[![socks](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/socks.png?raw=true "socks")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/socks.png?raw=true "socks")

### Marketplace for Limited Edition Products
Although Unisocks was launched as a proof of concept for a decentralized exchange, it demonstrated a viable path to disrupting the way physical goods are released. From a Luxury Brand's new line of apparel to VIP Concert Tickets, Fine Dining Restaurant Reservation to Small Batch Wine and Whisky sales, any limited edition product can be sold on a bonding curve. As such, our team has taken it upon ourselves to build exactly that, a marketplace on the ethereum blockchain for high end brands to launch their limited edition products. 

# Market Maker and Price Discovery of Products 
## Why Would Brands Want This? 
Brands like Nike or Supreme periodically drop limited edition products, however majority of the product's value kick in after the drop in secondary markets. These markets are often plagued with fraud and are a logistical nightmare for all parties involved. Token based rollout strategy will allow brands to not only capture part of the resale value of their products but also protect them from malicious 3rd parties. 

## Bonding Curve based Price Discovery 
Bonding Curves were made popular by DEFI platforms like Uniswap, Aave, and Bancor in order to ensure liquidity and remove the need for traditional market makers like in centralized orderbook based exchanges. Bonding Curves use a pricing algorithm that serves as the Automated Market Maker (AMM) so buyers and sellers of our product tokens can always ensure that there's someone on the other side to trade with. 

For our product tokens, first a user can stake tokens into the bonding curve's reserve pool, by doing so product tokens are minted for the user based on the pricing algorithm. When a token is purchased this way, every subsequent token will increase in price, meaning early buyers are rewarded as they can now sell their tokens back for a profit. 

## Formula 
Although there are many bonding curve formulas out there, we are adopting the Bancor Formula 
[![bancor](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/bancor.png?raw=true "bancor")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/bancor.png?raw=true "bancor")

- **Reserve Token** refers to the token that the users initially stake into the bonding curve
- **Continuous Token** is the product token received once **Reserve Tokens** are staked 
- **Reserve Ratio** is a fixed ratio from 0 to 1 between the **Continuous Token's** market cap and the value of the **Reserve Token** Balance.
- Since the **Reserve Ratio** is directly related to price sensitivity, this ratio will vary depending on the type of product being minted

Every buy and sell moves the Reserve Token Balance and Continuous Token Market cap, so in order to maintain our Reserve Ratio, the price of the Continuous(Product) Token will be continuously recalculated.

## Our Pricing Formula (Optimization in progress, open to suggestions)

### Our journey to discover the right bonding curve

Initially we had our sights on the famous Bancor Bonding curve. Not only was it the most popular but also the most documented and referenced literature. However very quickly we discovered its limitations pertaining our specific use case. 

### Bancor bonding curve is not designed for real world products

From the beginning, we can already foresee that a lot of the features and results that we seek for a bonding curve based commerce platform directly goes against the nature of bancor’s implementation. At a glance the Bancor curve should be able to conclude that token price = Reserve Balance / (Supply * reserve ratio). However there’s a catch here, this formula is designed for a framgentable token, thus the pricing function computes instantaneous price at a given supply value down to 10^18th decimal. This pricing logic falls apart completely when each product token by design has to be whole. Since each token is pegged to a real world item, it does not make sense for buyers to own partial products. Additionally because these are real items with real world market value we cannot initialize the token price at $0 when supply is also at 0. 

### If one cannot look sideways, look under

In order to solve the above mentioned problems, we had to do a deep dive on the derivation process of the Bancor equation. We started with the fundamental idea that we wanted a curve that resembled some sort of hockey stick growth: as supply is driven closer to the upper cap, the price for each token increases more drastically. With an exponential equation (eq. 1), we can control the behavior of token prices on both ends of the spectrum: m will control price behavior when supply in circulation is low, and n will control price behavior when supply in circulation is high.

[![Eq1](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/Eq1.png?raw=true "Eq1")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/Eq1.png?raw=true "Eq1")

In order to address the issue that our token cannot be fragmented, we have to look for a way to precisely calculate the price to purchase one token based on the instantaneous price function given in equation 1. Upon further learning, we realized that the area under the pricing curve actually represents the total amount of stake tokens in the pool. Hence we can model changes in reserve balance by computing the anti-derivative of the pricing function (eq. 2). Thereby, we can derive the equation further to compute precisely the price for k tokens given the existing supply of x (eq. 3 - 9). So far, this is all within the scope of bancor formula implementation; we had to make adjustments on our business logic to account for the indivisible nature of our tokens (i.e, adjust for price calculation and token transaction logic), but no deviation from existing Bancor implementation thus far.

[![Eq2](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/Eq2.png?raw=true "Eq2")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/Eq2.png?raw=true "Eq2")

### Amendment with initial price implementation

Implementing initial pricing is where deviation starts to show. Initially we thought about modifying the pricing function with a constant (eq. 10). This however introduces a new complexity, as we have arrived at a term that cannot be simplified easily (eq. 11 - 13), and not computationally viable if calculated as is. 

[![Eq3](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/Eq3.png?raw=true "Eq3")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/Eq3.png?raw=true "Eq3")

An alternative we chose to pursue is an equation similar to eq. 14. This has an advantage in that this does not modify any code of the existing Bancor curve implementation, and thereby minimizes risks for coding error. What we have to take into account however, is that based on the initial price (the ideal y intercept of p(s) when s = 0), we have to compute supply shift and reserve balance as prerequisites when creating a new token.

[![Eq4](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/Eq4.png?raw=true "Eq4")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/Eq4.png?raw=true "Eq4")

## Whale Alert 
In order to defend against pumps and dumps, we've incorporated two main forms of defense. The first is by means of the reserve ratio. The higher the reserve ratio between Reserve Token Balance and Product Token will lower the price sensitivity, this means depending on the product we can tweak the reserve ratio to ensure drastic price swings don't occur. The second is by means of KYC, we understand this may be a hotly debated issue, however as of now we have no other means of limiting the amount of the same product each individual can buy. This being said, we are open for community suggestions and open the floor to any members who may have a better and more anonymous way of ensuring a few individuals don't ruin the fun for everyone! 


# Tech Breakdown 
## Backend: Ethereum/Solidity 
Smart contracts written in solidity will mint new product tokens everytime a user deposits DAI or ETH into the Product Reserve Pools. The Product Token Value is calculated via a pricing function that you can directly inspect in this respository. 

## Frontend: Web
The market place's front end interface is a web application built on React. Buying, Trading, and Redemption of tokens can be performed on the web app interface. Redeeming a product token will send it to address 0, effectively burning it and removing it from circulation forever. Users interact with the market place the same way they would any other web application with the exception that Metamask is required to fully use the service.  

[![sample](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/sample.png?raw=true "sample")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/sample.png?raw=true "sample")

[![merchant](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/merchant.png?raw=true "merchant")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/merchant.png?raw=true "merchant")

## Virtual Reality 
The VR Component is an extension to the marketplace built in Unity. The VR Market is fully accessible on PC and Stand Alone VR platforms. It acts as a completely interactive metaverse for user to buy, trade, and redeem tokens in a more social environment. Every brand and product along with their associated token can be bought at Virtual Shops. Bigger brands will have more custom user experiences built into their stores depending on their partnership with us. All user tokens will be represented as interactive 3D objects once logged into our Virtual Market. We are working to include support for external tokens as well, for example a user with cryptokitties in their metamask wallet will have their PNG file converted to a completely rigged and animated 3D model. 

[![market](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/market.png?raw=true "market")](http://https://github.com/TravisBuilds/virtualmarket/blob/master/resources/market.png?raw=true "market")
 
## Features
We believe the future home of digital assets will most certainly be in Virtual Reality. We are building the shopping component of the shared metaverse. 
[![feature](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/feature.png?raw=true "feature")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/feature.png?raw=true "feature")

# Staking Yield and Token Utilities 

## Membership
Membership is a right earned by staking our platform token. Platform token utility includes the right to purchase product tokens, as well as the right to governance once our platform transitions into a full DAO.  

## Governance 
Owning platform tokens enable users to participate in the governance process through a decentralized organization, with proposals and voting structures. They are also able to vote on issues related to operations and how to streamline and onboard future products. 

## Tokenomics 
[![tokenomics](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/tokenomics.png?raw=true "allocation")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/tokenomics.png?raw=true "tokenomics")

## Staking Yield 
Staking incentives are our way of creating monetary and governance incentives for our most committed members. Highstreet Market is introducing a new type of liquidity mining based on a proof of play system, where users can earn Street Tokens by completing certain tasks in the marketplace. At the start we will be joining forces with HTC and their Viveport platform to allow existing Viveport subscribers to turn on the mining option and start earning Street Tokens on day one. The tokens can be directly sold on centralized and decentralized exchanges, however as a further incentive for users to provide utility to the platform, users who purchase products through the marketplace using our Street Token will be rewarded with a portion of our transaction fees. Essentially, the more they buy the more they earn!

[![allocation](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/whiteal.png?raw=true "allocation")](https://github.com/TravisBuilds/virtualmarket/blob/master/resources/whiteal.png?raw=true "allocation")

## Future Endeavors 
As our market evolves, so does the complexity of our tokenomics. Our goal is to create a truly decentralized metaverse where gamers and game developers alike can link their worlds to our market place with a simple pluggin. Our proof of play based liquidity mining today serves as an incentive not only for VR users to migrate onto the platform, but also serves as a potential catalyst for newcomers into the world of virtual reality. We reward users with Street Tokens based on platform usage, and as such we can learn and improve the overall system of the marketplace. However one of the stretch goals we wish to achieve by the end of the year has to be the third party Unity Sdk. We throughout the next couple months our team can work out a series of metrics and criteria to qualify certain gaming actions as “mine-able”. Some of these requirements include actions that take a definite amount of time to prevent botting, or strong anti-cheat softwares to prevent malicious users in abusing the system. Once a cross-genre list of rules can be generated than we should be able to simply plug into any existing game’s source code and allow their users to start mining for tokens on Viveport. 
