-- First, create the new table
CREATE TABLE application (
  name text PRIMARY KEY,
  description text,
  image text,
  createdAt TIMESTAMP with time zone,
  updatedAt TIMESTAMP with time zone);

-- And fill it with a default application
INSERT INTO application (name, description, image, createdAt, updatedAt)
VALUES ('default', 'Awesome Electron Application', '/images/logo.svg', NOW(), NOW());

-- Add the link to this new table and a new pk-column
ALTER TABLE version
DROP CONSTRAINT version_pkey,
ADD COLUMN id SERIAL PRIMARY KEY,
ADD COLUMN application text;

-- Link all the existing version to the default application
UPDATE version SET application = 'default';

-- Finally relink correctly the assets to the version table, through the new pk
ALTER TABLE asset
ADD COLUMN version_id integer;

UPDATE asset SET version_id = version.id
FROM version
WHERE asset.version = version.name;

-- And clean up the columns of the asset table
ALTER TABLE asset
DROP COLUMN version;

ALTER TABLE asset
RENAME COLUMN version_id TO version;
