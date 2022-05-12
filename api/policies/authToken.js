/**
 * authToken
 *
 * @module      :: Policy
 * @description :: Ensure that the user is authenticated with an authToken
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  var token;

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.forbidden('Wrong authorization format.');
    }
  } else if (req.param('token')) {
    token = req.param('token');
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    return res.forbidden('No authorization header found.');
  }

  AuthToken.verifyToken(token, function(err, decodedToken) {
    if (err) return res.forbidden('Invalid Token.');
    req.token = decodedToken.sub;
    next();
  });
};
