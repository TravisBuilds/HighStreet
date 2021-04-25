const path = require('path');
const express = require('express');
const db = require('./lib/db');
const passport = require('./lib/passport');

if (!process.env.NODE_ENV) {
    require('dotenv').config();
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(passport.initialize());

app.get('/api/hello', (req, res) => res.send({ hello: 'world' }));
// app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
// app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), Auth.oauthCallback);

app.use('/', express.static(path.join(__dirname, '../client/build')));
app.use('/:page', express.static(path.join(__dirname, '../client/build')));

const server = app.listen(process.env.PORT || 3030);
server.on('listening', () => console.log(`Server listening on port ${process.env.PORT || 3030}`));

process.on('unhandledRejection', (r) => {
    logger.error('unhandledRejection', r);
    process.exit(1);
});
