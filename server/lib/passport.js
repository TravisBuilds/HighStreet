const passport = require('passport');
const InstagramStrategy = require('passport-instagram-basic-api').Strategy;
const jwt = require('jsonwebtoken');
const db = require('./db');

const { INSTAGRAM_CLIENT_ID: clientID, INSTAGRAM_CLIENT_SECRET: clientSecret } = process.env;
const callbackURL = process.env.INSTAGRAM_CALLBACK_URL || 'https://localhost:3030/auth/instagram/callback';

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new InstagramStrategy({
    clientID,
    clientSecret,
    callbackURL,
    scope: ['user_profile', 'user_media']
  }, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      // TODO: use accessToken and get more info
      const { merchants } = db.collections;
      merchants.insertOne({
        instagramId: profile.id,
        instagramUsername: profile.username
      }, () => {
        const jwtToken = jwt.sign({ id: profile.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        done(null, { jwtToken });
      });
    });
  })
);

module.exports = passport;
