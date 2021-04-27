// Import ProductToken.sol here.

export default (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_ETH_ADDR':
      return {
        ...state,
        selectedEthAddr: action.payload
      };
    case 'SET_ETH_WEB3':
      return {
        ...state,
        ethWeb3: action.payload

      };
    case 'SET_ETH_BALANCE':
      return {
        ...state,
        ethBalance: action.payload
      };
    case 'SET_ETH_INJECTED_PROVIDER':
      return {
        ...state,
        injectedProvider: action.payload
      };
    case 'SET_ETHERS_PROVIDER':
      return {
        ...state,
        ethersProvider: action.payload
      };
    case 'SET_LOOM_OBJ':
      return {
        ...state,
        loomObj: action.payload
      };
    case 'SET_LOOM_CONNECTION_INFO':
      return {
        ...state,
        loomConnectionInfo: action.payload
      };
    default:
      return state;
  }
};
