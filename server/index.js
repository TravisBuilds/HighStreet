const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(path.resolve(process.cwd(), '../.env'));
}

const fs = require('fs');
const express = require('express');
const https = require('https')
const cookieParser = require('cookie-parser');
const db = require('./lib/db');
const passport = require('./lib/passport');
const Auth = require('./routes/auth');
const Product = require('./routes/product');
const User = require('./routes/user');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), Auth.oauthCallback);

app.post('/api/user', User.emailSignup);
app.get('/api/user/:walletAddress', User.getByWalletAddress);
app.post('/api/user/connectMetamask', User.connectMetamask);

app.get('/api/products', Product.list);

app.use('/', express.static(path.join(__dirname, '../client/build')));
app.use('/:page', express.static(path.join(__dirname, '../client/build')));

db.openConnection().then(() => {
  if (process.env.NODE_ENV === 'production') {
    const server = app.listen(process.env.PORT || 3030);
    server.on('listening', () => console.log(`Server listening on port ${process.env.PORT || 3030}`));
  } else {
    const server = https.createServer({
      key: fs.readFileSync('./server/server.key'),
      cert: fs.readFileSync('./server/server.cert')
    }, app).listen(process.env.PORT || 3030);
    server.on('listening', () => console.log(`Server listening on port ${process.env.PORT || 3030}`));
  }
});

process.on('unhandledRejection', (r) => {
  console.error('unhandledRejection', r);
  process.exit(1);
});
