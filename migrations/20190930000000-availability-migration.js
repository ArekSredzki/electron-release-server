'use strict';

const { driver } = require('db-migrate').getInstance().config.getCurrent().settings;

const sql = {

  // PostgreSQL
  pg: {
    up: (

      // Add `availability` column (if doesn't exist) to `version` table
      'ALTER TABLE version ADD COLUMN IF NOT EXISTS availability TIMESTAMPTZ;'

    ),
    down: (

      // Drop `availability` column (if exists) from `version` table
      'ALTER TABLE version DROP COLUMN IF EXISTS availability;'

    )
  }

};

const { up } = driver && sql[driver];
const { down } = driver && sql[driver];

exports.up = db => up ? db.runSql(up) : null;
exports.down = db => down ? db.runSql(down) : null;
