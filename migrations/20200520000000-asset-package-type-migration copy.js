'use strict';

const { driver } = require('db-migrate').getInstance().config.getCurrent().settings;

const sql = {

  // PostgreSQL
  pg: {
    up: (

      // Add `package_type` column (if doesn't exist) to `asset` table
      'ALTER TABLE asset ADD COLUMN IF NOT EXISTS package_type TEXT;'

    ),
    down: (


      // Drop `package_type` column (if exists) from `asset` table
      'ALTER TABLE asset DROP COLUMN IF EXISTS package_type;'

    )
  }

};

const { up } = driver && sql[driver];
const { down } = driver && sql[driver];

exports.up = db => up ? db.runSql(up) : null;
exports.down = db => down ? db.runSql(down) : null;
