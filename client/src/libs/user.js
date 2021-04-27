function connectMetamask(walletAddress, avatarUrl) {
  return fetch('/api/user/connectMetamask', {
    method: 'POST',
    body: JSON.stringify({
      walletAddress,
      avatarUrl
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json());
}

module.exports = {
  connectMetamask
};
