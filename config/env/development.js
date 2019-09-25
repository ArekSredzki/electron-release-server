/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    connection: 'postgresql'
  },

  connections: {
    postgresql: {
      adapter: 'sails-postgresql',
      host: process.env['DB_HOST'] || process.env['DATABASE_URL'].split('@')[1].split(':')[0],
      port: process.env['DB_PORT'] || process.env['DATABASE_URL'].split('@')[1].split(':')[1].split('/')[0],
      user: process.env['DB_USERNAME'] || process.env['DATABASE_URL'].split('@')[0].split(':')[1].split('/')[2],
      password: process.env['DB_PASSWORD'] || process.env['DATABASE_URL'].split('@')[0].split(':')[2],
      database: process.env['DB_NAME'] || process.env['DATABASE_URL'].split('/')[3],
      ssl: true,
    }
  }
};
