
CREATE TABLE application (
  name text PRIMARY KEY,
  description text,
  image text,
  createdAt TIMESTAMP with time zone,
  updatedAt TIMESTAMP with time zone);

INSERT INTO application (name, description, image, createdAt, updatedAt)
VALUES ('default', 'Awesome Electron Application', '/images/logo.svg', NOW(), NOW());

ALTER TABLE version
DROP CONSTRAINT version_pkey,
ADD COLUMN id SERIAL PRIMARY KEY,
ADD COLUMN application text;

UPDATE version SET application = 'default';

ALTER TABLE asset
ADD COLUMN version_id integer;

UPDATE asset SET version_id = version.id
FROM version
WHERE asset.version = version.name;

ALTER TABLE asset
DROP COLUMN version;

ALTER TABLE asset
RENAME COLUMN version_id TO version;
