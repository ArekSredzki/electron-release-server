'use strict';

const { driver } = require('db-migrate').getInstance().config.getCurrent().settings;

const sql = {

  // PostgreSQL
  pg: {
    up: (

      // Add `id` column (if doesn't exist) to `asset` table
      'ALTER TABLE asset ADD COLUMN IF NOT EXISTS id TEXT;' +

      // Populate `id` column in `asset` table with default data if empty
      'UPDATE asset SET id = CONCAT(version, \'_\', platform, \'_\', REPLACE(filetype, \'.\', \'\')) WHERE id IS NULL;' +

      // Drop primary key constraint (if exists) from `asset` table
      'ALTER TABLE asset DROP CONSTRAINT IF EXISTS asset_pkey;' +

      // Add primary key constraint on `id` column in `asset` table
      'ALTER TABLE asset ADD PRIMARY KEY (id);'

    ),
    down: (

      // Drop `id` column (if exists) from `asset` table
      'ALTER TABLE asset DROP COLUMN IF EXISTS id;' +

      // Drop primary key constraint (if exists) from `asset` table
      'ALTER TABLE asset DROP CONSTRAINT IF EXISTS asset_pkey;' +

      // Add primary key constraint on `name` column in `asset` table
      'ALTER TABLE asset ADD PRIMARY KEY (name);'

    )
  }

};

const { up } = driver && sql[driver];
const { down } = driver && sql[driver];

exports.up = db => up ? db.runSql(up) : null;
exports.down = db => down ? db.runSql(down) : null;
