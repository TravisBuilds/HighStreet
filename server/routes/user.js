const { reset } = require('nodemon');
const db = require('../lib/db');

async function connectMetamask(req, res) {
  const { users } = db.collections;
  const { walletAddress, avatarUrl } = req.body;

  const user = await users.findOne({ walletAddress });
  if (user) {
    res.send({ user });
    return;
  }

  const newUser = await users.insertOne({ walletAddress, avatarUrl });
  res.send({ user: newUser });
}

module.exports = {
  connectMetamask
};
