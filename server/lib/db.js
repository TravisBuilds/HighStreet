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

      resolve();
    });
  });
}

function closeConnection() {
  globalClient.close();
}

module.exports = {
  openConnection,
  closeConnection,
  collections
};
