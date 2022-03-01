/**
 * Authentication Controller
 *
 */

var AuthController = {
  login: function(req, res) {
    AuthService.authenticate(
      req,
      sails.config.auth,
      function(err, user) {

        if (err) {
          return res.send(err.code || 401, err.message || 'Incorrect credentials');
        }

        if (!user) {
          // If there is no error passed then we should have a user object
          return res.serverError('Could not retrieve user');
        }

        const token = AuthToken.issueToken({
          sub: user.username
        })

        res.cookie("authToken", token, {httpOnly: true, maxAge: 900000, secure: true})

        return res.json({
          user: user.username,
          token: token
        });
      });
  }

  // Logout is handled client-side
};

module.exports = AuthController;
