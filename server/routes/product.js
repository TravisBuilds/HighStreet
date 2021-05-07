const db = require('../lib/db');

async function list(req, res) {
  const { products } = db.collections;
  const allProducts = await products.findAll();
  res.send(allProducts);
}

module.exports = {
  list
};
