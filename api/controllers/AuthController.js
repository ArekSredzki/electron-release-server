/**
 * Authentication Controller
 *
 */

var AuthController = {
  login: function(req, res) {
    LDAPService.authenticate(
      req, (sails.config.auth || {}).ldap,
      function(err, user) {

        if (err) {
          return res.send(err.code || 401, err.message || 'Incorrect credentials');
        }

        if (!user) {
          // If there is no error passed then we should have a user object
          return res.serverError('Could not retrieve user');
        }

        return res.json({
          user: user.sAMAccountName,
          token: AuthToken.issueToken({
            sub: user.sAMAccountName
          })
        });
      });
  }

  // Logout is handled client-side
};

module.exports = AuthController;
