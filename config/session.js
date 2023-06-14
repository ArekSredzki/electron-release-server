/**
 * Session Configuration
 * (sails.config.session)
 *
 * Sails session integration leans heavily on the great work already done by
 * Express, but also unifies Socket.io with the Connect session store. It uses
 * Connect's cookie parser to normalize configuration differences between Express
 * and Socket.io and hooks into Sails' middleware interpreter to allow you to access
 * and auto-save to `req.session` with Socket.io the same way you would with Express.
 *
 * For more information on configuring the session, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.session.html
 */

module.exports.session = {
  // XXX: Enable this if you are using postgres as your database
  // If so, be sure to run the sql command detailed here: https://github.com/ravitej91/sails-pg-session

  //  // uncomment if you use v2land-sails-pg-session
  // TODO: password will need to be changed
  postgresql: {
    adapter: 'v2land-sails-pg-session',
    host: 'localhost',
    user: 'electron_release_server_user',
    password: 'iceland123',
    database: 'electron_release_server'
  }

  //  // uncomment if you use sails-pg-session
  //  postgresql: {
  //      adapter: 'sails-pg-session',
  //      host: 'localhost',
  //      user: 'electron_release_server_user',
  //      password: 'MySecurePassword',
  //      database: 'electron_release_server'
  //  }
};
