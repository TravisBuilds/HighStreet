const db = require('../lib/db');

async function emailSignup(req, res) {
  const { name, email, password } = req.body;
  res.send({});
}

async function connectMetamask(req, res) {
  const { users } = db.collections;
  const { email, walletAddress, avatarUrl } = req.body;

  const user = await users.findOne({ email });
  if (user) {
    res.send({ user });
    return;
  }

  const newUser = await users.insertOne({ email, walletAddress, avatarUrl });
  res.send({ user: newUser });
}

async function getByWalletAddress(req, res) {
  const { email } = req.query;
  const user = await users.findOne({ email });
  res.send({ user });
}

module.exports = {
  emailSignup,
  connectMetamask,
  getByWalletAddress
};
