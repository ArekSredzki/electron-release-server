/**
 * Docker environment settings
 */

module.exports = {

  models: {
    connection: 'postgresql',
    migrate: 'alter'
  },

  port: 80,

  log: {
    level: process.env['LOG_LEVEL']
  },

  auth: {
    static: {
      username: process.env['APP_USERNAME'],
      password: process.env['APP_PASSWORD']
    }
  },
  appUrl: process.env['APP_URL'],
  connections: {
    postgresql: {
      adapter: 'sails-postgresql',
      host: process.env['DB_HOST'],
      port: process.env['DB_PORT'],
      user: process.env['DB_USERNAME'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_NAME']
    }
  },
  jwt: {
    // Recommended: 63 random alpha-numeric characters
    // Generate using: https://www.grc.com/passwords.htm
    token_secret: process.env['TOKEN_SECRET'],
  },
  files: {
    dirname: '/tmp/',
  },
  session: {
    // Recommended: 63 random alpha-numeric characters
    // Generate using: https://www.grc.com/passwords.htm
    token_secret: process.env['TOKEN_SECRET'],
    database: process.env['DB_NAME'],
    host: process.env['DB_HOST'],
    user: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    port: process.env['DB_PORT'],
  }

};

