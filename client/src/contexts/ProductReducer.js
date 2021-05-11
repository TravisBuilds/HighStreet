// Import ProductToken.sol here.

export default (state, action) => {
  switch (action.type) {
    case 'TOKEN_AVAILABLE':
      return {
        ...state,
        products: state.products.map((product) => {
          if (product.name === action.product.name) {
            const updatedProduct = {
              ...product,
              available: action.available
            };
            return updatedProduct;
          }
          return product;
        })
      };
    case 'TOKEN_PRICE':
      return {
        ...state,
        products: state.products.map((product) => {
          if (product.name === action.product.name) {
            const updatedProduct = {
              ...product,
              price: action.price
            };
            return updatedProduct;
          }
          return product;
        })
      };
    case 'TOKEN_BOUGHT':
      return {
        ...state,
        products: state.products.map((product) => {
          if (product.name === action.payload) {
            const updatedProduct = {
              ...product,
              // call tokenInstance.buy() here with ether amount to buy one token
              price: product.price * 1.13, // price: tokenInstance.getCurrentPrice()
              available: product.available - 1 // available: tokenInstance.getAvailability()
            };
            return updatedProduct;
          }
          return product;
        })
      };

    case 'TOKEN_SOLD':
      return {
        ...state,
        products: state.products.map((product) => {
          if (product.name === action.payload) {
            const updatedProduct = {
              ...product,
              // arbitrary decrease price, will connect smart contract here
              // call tokenInstance.sell(amount) here with desired sell unit
              price: product.price * 0.9, // price: tokenInstance.getCurrentPrice()
              available: product.available + 1 // available: tokenInstance.getAvailability()
            };
            return updatedProduct;
          }
          return product;
        })
      };

    case 'TOKEN_REDEEMED':
      return {
        ...state,
        products: state.products.map((product) => {
          if (product.name === action.payload) {
            const updatedProduct = {
              ...product,
              // burn token
              // call tokenInstance.tradein(amount) here with desired sell unit
              price: product.price * 1.15, // price: tokenInstance.getCurrentPrice()
              supply: product.supply - 1 // available: tokenInstance.getAvailability()
            };
            return updatedProduct;
          }
          return product;
        })
      };
    default:
      return state;
  }
};
