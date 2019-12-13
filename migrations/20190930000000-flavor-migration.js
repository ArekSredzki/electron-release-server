'use strict';

const { driver } = require('db-migrate').getInstance().config.getCurrent().settings;

const sql = {

  // PostgreSQL
  pg: {
    up: (

      // Create `flavor` table (if doesn't exist)
      'CREATE TABLE IF NOT EXISTS flavor (name TEXT PRIMARY KEY, "createdAt" TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ);' +

      // Add `id` column (if doesn't exist) to `version` table
      'ALTER TABLE version ADD COLUMN IF NOT EXISTS id TEXT;' +

      // Add `flavor` column (if doesn't exist) to `version` table
      'ALTER TABLE version ADD COLUMN IF NOT EXISTS flavor TEXT;' +

      // Drop primary key constraint (if exists) from `version` table
      'ALTER TABLE version DROP CONSTRAINT IF EXISTS version_pkey;' +

      // Populate `id` column in `version` table with default data if empty
      'UPDATE version SET id = CONCAT(name, \'_\', COALESCE(flavor, \'default\')) WHERE id IS NULL;' +

      // Add primary key constraint on `id` column in `version` table
      'ALTER TABLE version ADD PRIMARY KEY (id);'

    ),
    down: (

      // Drop `flavor` table (if exists)
      'DROP TABLE IF EXISTS flavor;' +

      // Drop `id` column (if exists) from `version` table
      'ALTER TABLE version DROP COLUMN IF EXISTS id;' +

      // Drop `flavor` column (if exists) from `version` table
      'ALTER TABLE version DROP COLUMN IF EXISTS flavor;' +

      // Drop primary key constraint (if exists) from `version` table
      'ALTER TABLE version DROP CONSTRAINT IF EXISTS version_pkey;' +

      // Add primary key constraint on `name` column in `version` table
      'ALTER TABLE version ADD PRIMARY KEY (name);' +

      // Depopulate default data from `version` column in `asset` table
      'UPDATE asset SET version = REPLACE(version, \'_default\', \'\') WHERE version LIKE \'%_default\';'

    )
  }

};

const { up } = driver && sql[driver];
const { down } = driver && sql[driver];

exports.up = db => up ? db.runSql(up) : null;
exports.down = db => down ? db.runSql(down) : null;
