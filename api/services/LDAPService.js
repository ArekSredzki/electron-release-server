/**
 * Simple LDAP authentication service
 */
var LdapAuth = require('ldapauth-fork');

var LDAPService = {};

/**
 * Add default values to options
 *
 * @param   options
 * @returns {*}
 */
var setDefaults = function(options) {
  options.usernameField = (options.usernameField || 'username');
  options.passwordField = (options.passwordField || 'password');
  return options;
};

/**
 * Get value for given field from given object. Taken from passport-local,
 * copyright 2011-2013 Jared Hanson
 */
var lookup = function(obj, field) {
  var i, len, chain, prop;
  if (!obj) {
    return null;
  }
  chain = field.split(']').join('').split('[');
  for (i = 0, len = chain.length; i < len; i++) {
    prop = obj[chain[i]];
    if (typeof(prop) === 'undefined') {
      return null;
    }
    if (typeof(prop) !== 'object') {
      return prop;
    }
    obj = prop;
  }
  return null;
};

/**
 * LDAPService authentication
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
 *     LDAPService.authenticate({
 *         server: {
 *           url: 'ldap://localhost:389',
 *           bindDn: 'cn=root',
 *           bindCredentials: 'secret',
 *           searchBase: 'ou=passport-ldapauth',
 *           searchFilter: '(uid={{username}})'
 *         }
 *       },
 *       function(err, user) {
 *       	 if (err) return;
 *         console.log('User ' + user.sAMAccountName + ' has been authenticated');
 *       }
 *     ));
 */
LDAPService.authenticate = function(req, options, cb) {
  var username, password, ldap;
  if (!options) {
    throw new Error('LDAP authentication requires options');
  }

  options = setDefaults(options);

  username = lookup(req.body, options.usernameField) || lookup(req.query, options.usernameField);
  password = lookup(req.body, options.passwordField) || lookup(req.query, options.passwordField);

  if (!username || !password) {
    return cb({
      message: options.badRequestMessage || 'Missing credentials',
      code: 400
    });
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

    return cb(null, user);
  });
};

module.exports = LDAPService;
