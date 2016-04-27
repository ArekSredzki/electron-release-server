/**
 * Simple Authentication Service
 *
 * Currently supported methods:
 *  - static
 *  - LDAP
 */
var _ = require('lodash');
var LdapAuth = require('ldapauth-fork');

var AuthService = {};

AuthService.authenticate = function(req, options, cb) {
  var username, password, ldap;
  if (!options) {
    throw new Error('Authentication requires options');
  }

  username = req.param('username');
  password = req.param('password');

  if (!username || !password) {
    return cb({
      message: options.badRequestMessage || 'Missing credentials',
      code: 400
    });
  }

  if (_.has(options, 'static')) {
    if (_.has(options, 'ldap')) {
      var originalCb = cb;

      cb = function(err, user) {
        if (err) {
          return AuthService._authenticateLDAP(
            username,
            password,
            options.ldap,
            function(secondErr, user) {
              if (secondErr) {
                return originalCb(err);
              }

              originalCb(null, user);
            }
          );
        }

        originalCb(null, user);
      };
    }

    AuthService._authenticateStatic(username, password, options.static, cb);
  } else if (_.has(options, 'ldap')) {
    AuthService._authenticateLDAP(username, password, options.ldap, cb);
  } else {
    throw new Error('Authentication options incomplete.');
  }
};

AuthService._authenticateStatic = function(username, password, options, cb) {
  var ldap;
  if (!options) {
    throw new Error('LDAP authentication requires options');
  }

  if (
    username !== options.username ||
    password !== options.password
  ) {
    return cb({
      message: 'Invalid username/password',
      code: 401
    });
  } else {
    return cb(
      null, {
        username: username
      }
    );
  }
};

/**
 * LDAP authentication
 *
 * The LDAP authentication strategy authenticates requests based on the
 * credentials submitted through an HTML-based login form.
 *
 * Applications may supply a `verify` callback which accepts `user` object
 * and then calls the `done` callback supplying a `user`, which should be set
 * to `false` if user is not allowed to authenticate. If an exception occured,
 * `err` should be set.
 *
 * Options:
 * - `server`  options for ldapauth, see https://github.com/trentm/node-ldapauth
 * - `usernameField`  field name where the username is found, defaults to _username_
 * - `passwordField`  field name where the password is found, defaults to _password_
 * - `passReqToCallback`  when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Options can be also given as function that accepts a callback end calls it
 * with error and options arguments. Notice that the callback is executed on
 * every authenticate call.
 *
 * Example:
 *
 *     AuthService._authenticateLDAP(
 *     	'myusername',
 *     	'mypassword',
 *     	sails.config.auth,
 *       function(err, user) {
 *       	 if (err) return;
 *         console.log('User ' + user.username + ' has been authenticated');
 *       }
 *     ));
 */
AuthService._authenticateLDAP = function(username, password, options, cb) {
  var ldap;
  if (!options) {
    throw new Error('LDAP authentication requires options');
  }

  /**
   * AD possible messages
   * http://www-01.ibm.com/support/docview.wss?uid=swg21290631
   */
  var messages = {
    '530': options.invalidLogonHours || 'Not Permitted to login at this time',
    '531': options.invalidWorkstation || 'Not permited to logon at this workstation',
    '532': options.passwordExpired || 'Password expired',
    '533': options.accountDisabled || 'Account disabled',
    '534': options.accountDisabled || 'Account disabled',
    '701': options.accountExpired || 'Account expired',
    '773': options.passwordMustChange || 'User must reset password',
    '775': options.accountLockedOut || 'User account locked',
    default: options.invalidCredentials || 'Invalid username/password'
  };

  ldap = new LdapAuth(options.server);
  ldap.authenticate(username, password, function(err, user) {
    ldap.close(function() {}); // We don't care about the closing

    if (err) {
      // Invalid credentials / user not found are not errors but login failures
      if (
        err.name === 'InvalidCredentialsError' ||
        err.name === 'NoSuchObjectError' ||
        (typeof err === 'string' && err.match(/no such user/i))
      ) {
        var message = options.invalidCredentials || 'Invalid username/password';

        if (err.message) {
          var ldapComment = err.message.match(/data ([0-9a-fA-F]*), v[0-9a-fA-F]*/);
          if (ldapComment && ldapComment[1]) {
            message = messages[ldapComment[1]] || messages['default'];
          }
        }
        return cb({
          message: message,
          code: 401
        });
      }
      if (err.name === 'ConstraintViolationError') {
        return cb({
          message: options.constraintViolation || 'Exceeded password retry limit, account locked',
          code: 401
        });
      }
      // Other errors are (most likely) real errors
      return cb(err);
    }

    if (!user) return cb({
      message: options.userNotFound || 'Invalid username/password',
      code: 401
    });

    // Check that the user is a member of the allowed user group
    if (
      options.group &&
      (!user.memberOf || user.memberOf.indexOf(options.group) === -1)
    ) {
      return cb({
        message: options.userNotAuthorized || 'Your account is not authorized.',
        code: 401
      });
    }

    _.set(user, 'username', _.get(user, options.usernameField));

    return cb(null, user);
  });
};

module.exports = AuthService;
