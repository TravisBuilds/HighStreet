const { MongoClient } = require('mongodb');

let db = null;
let globalClient = null;
const collections = {};

async function openConnection(uConfig = {}) {
  const config = {
    mongoDbName: process.env.MONGO_DBNAME,
    mongoUrl: process.env.MONGO_URL,
    ...uConfig
  };

  return new Promise((resolve) => {
    MongoClient.connect(config.mongoUrl, {
      useUnifiedTopology: true
    }, (error, client) => {
      if (error) {
        console.log('Unable to connect to database');
        console.log(error);
        process.exit(1);
      } else if (!client) {
        console.log('Unable to get the database object');
        process.exit(1);
      }

      globalClient = client;
      db = client.db(config.mongoDbName);

      collections.users = db.collection('users');
      collections.merchants = db.collection('merchants');
      collections.products = db.collection('products');

      populateInitialDb(collections);

      resolve();
    });
  });
}

function closeConnection() {
  globalClient.close();
}

function populateInitialDb(c) {
  const { products } = c;

  products.insertMany([{
    name: 'Kalon Tea',
    merchant: 'Kalon Tea',
    ticker: 'KLT',
    initPrice: 12,
    supply: 500, // tokenInstance.getSupply()
    tagline: 'Essence of Nature',
    blurb: "Nature's first green is gold, infused in a liquor that will make it truly last forever"
  }, {
    name: "L'Oréal ",
    merchant: "L'Oréal ",
    ticker: 'OREAL',
    initPrice: 20,
    supply: 2500,
    tagline: "Because you're worth it ",
    blurb: "Be the star that you were always meant to be, L'oreal, because you're worth it"
  }, {
    name: 'Mystery Box',
    merchant: 'Mystery Box',
    ticker: 'RAND',
    initPrice: 15,
    supply: 1000,
    tagline: 'Try Me',
    blurb: 'buy me for the chance to redeem anything in our entire catalog'
  }, {
    name: 'LVMH',
    merchant: 'LVMH',
    ticker: 'LVMH',
    initPrice: 122,
    supply: 3000,
    tagline: 'Making it Real',
    blurb: 'A timeless first and a vibrant way to touch up both your digital and IRL identity'
  }]);
}

module.exports = {
  openConnection,
  closeConnection,
  collections
};
