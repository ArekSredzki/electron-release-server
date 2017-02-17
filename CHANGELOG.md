# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Support of multiple applications in the same instance
- A Changelog :smile:

### Breaking Changes
- `Version` Primary Key is now an auto-generated integer instead of the name of
the `version`

[A migration script](migrate-multi-app.sql) is provided to preserve the database
content while adopting the new schema. Simply run it against your PostgreSQL
database before lifting this version of the server.

**NOTE:** The migration script was written with PostgreSQL only in mind,
and may require some modifications to be able to run it on another DBMS.
