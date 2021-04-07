export default (state, action) => {
    switch (action.type) {
        case 'TOKEN_BOUGHT':
            return {
                ...state,
                products: state.products.map((product) => {

                    if (product.name === action.payload) {
                        
                        const updatedProduct = {
                            ...product,
                            
                            price: product.price * 1.13,
                            available: product.available - 1
                        }
                        return updatedProduct
                    };
                    return product
                })
            }



        case 'TOKEN_SOLD':
            return {
                ...state,
                products: state.products.map((product) => {
                    if (product.name === action.payload) {
                        const updatedProduct = {
                            ...product,
                            //arbitrary decrease price, will connect smart contract here 
                            price: product.price * 0.9,
                            available: product.available + 1
                        };
                        return updatedProduct;
                    }
                    return product;
                })
            }

        case 'TOKEN_REDEEMED':
            return {
                ...state,
                products: state.products.map((product) => {
                    if (product.name === action.payload) {
                        const updatedProduct = {
                            ...product,
                            //burn token
                            price: product.price * 1.15,
                            supply: product.supply - 1
                        };
                        return updatedProduct;
                    }
                    return product
                })
            }
        default:
            return state;
    }
}