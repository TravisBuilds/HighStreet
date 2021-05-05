const expressJWT = require('express-jwt');

const cookieAge = 60 * 60 * 1000; // 1 hour

function requireLogin() {
  const secret = process.env.JWT_SECRET;
  return expressJWT({
    secret,
    algorithms: ['HS256'],
    getToken: (req) => {
      if (req.headers.authorization && ['bearer', 'jwt'].includes(req.headers.authorization.split(' ')[0].toLowerCase())) {
        return req.headers.authorization.split(' ')[1];
      } if (req.query && req.query.token) {
        return req.query.token;
      } if (req.cookies && req.cookies.jwt) {
        return req.cookies.jwt;
      }
      return null;
    }
  });
}

function oauthCallback(req, res) {
  const { jwtToken } = req.user;
  res.cookie('jwt', jwtToken, { httpOnly: true, maxAge: cookieAge });
  res.redirect('/');
}

module.exports = {
  requireLogin,
  oauthCallback
};
