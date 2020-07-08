# Database Setup
The following is a recommended database setup process.

## Prerequisites
Before you continue, you will need to have an instance on the PostgresSQL database running on a host.

You will additionally need to have the following details handy (see instruction below):
- Host name
- The username & password for an account with privileges to create a user, create a database &
assign a user to the database.

If you need help installing the database, the following link contains
detailed [installaing guides](https://wiki.postgresql.org/wiki/Detailed_installation_guides).

## PostgreSQL
Using the details listed in the prerequisites, connect to the PostgreSQL database using
psql ([PostgreSQL interactive terminal](http://www.postgresql.org/docs/9.2/static/app-psql.html)).
You need to connect as admin user _postgres_
~~~
C:\Program Files\PostgreSQL\9.5\bin>psql.exe --username=postgres
~~~


You now need to create dedicated _postgres_ role using PostgreSQL terminal syntax
```sql
CREATE ROLE electron_release_server_user ENCRYPTED PASSWORD '<PASSWORD>' LOGIN;
```

Example:
~~~sql
CREATE ROLE electron_release_server_user ENCRYPTED PASSWORD 'MySecurePassword' LOGIN;
~~~
> Hint: if you need a password, use this https://www.grc.com/passwords.htm
>
> (63 random alpha-numeric characters)


Create databases for created role (_electron_release_server_user_)
```sql
CREATE DATABASE electron_release_server OWNER "electron_release_server_user";
CREATE DATABASE electron_release_server_sessions OWNER "electron_release_server_user";
```
After completing this section, you should now have
1. host - hostname of your postgres database server
2. user - username to be used by the application (electron_release_server_user)
3. password - password to be used by the application
4. server database - database name for the server (electron_release_server)
5. server database - database name for the server (electron_release_server_sessions)
> Hint: You now need to ensure that these settings are reflected in the `config/local.js` file.

```
    connections: {
        postgresql: {
            adapter: 'sails-postgresql',
            host: 'localhost',
            user: 'electron_release_server_user',
            password: 'MySecurePassword',
            database: 'electron_release_server'
        }
    },

    session: {
        // Recommended: 63 random alpha-numeric characters
        // Generate using: https://www.grc.com/passwords.htm
        secret: 'EB9F0CA4414893F7B72DDF0F8507D88042DB4DBF8BD9D0A5279ADB54158EB2F0',
        database: 'electron_release_server_sessions',
        host: 'localhost',
        user: 'electron_release_server_user',
        password: 'MySecurePassword',
        port: 5432
    }
```

### Session adapter requirements
For the session adapter you can use one of the following adapters:
- v2land-sails-pg-session
- sails-pg-session

For **_v2land-sails-pg-session_** use following sample, navigate to your GIT folder with repos and run
```bash
mkdir sails_pg_session_v2
cd sails_pg_session_v2
git clone https://github.com/v2land/sails-pg-session.git .
npm update
psql electron_release_server_sessions < ./sql/sails-pg-session-support.sql postgres
```

If you use **_sails-pg-session_** then follow next sample, navigate to your GIT folder with repos and run
```bash
mkdir sails_pg_session
cd sails_pg_session
git clone https://github.com/ravitej91/sails-pg-session.git .
npm update
psql electron_release_server_sessions < ./sql/sails-pg-session-support.sql postgres
```

In order to use Database you need to update `config/session.js`. For you comfort snippets were added in existing file.
Uncomment snippet to enable adapter of your choice (either _v2land-sails-pg-session_ or _sails-pg-session_)

> Hint: Use the same **process** as mentioned above to generate the session &
>JWT secret keys stored in `config/local.js`
>

Originally described [here](https://github.com/ravitej91/sails-pg-session)

## Issues
Please refer to Frequently Asked Questions section of documentation in case if you still see some issue

## Migration
If you have a pre-existing database and want to update to a new version of Electron Release Server that has database
changes, then you may be able to use migration scripts stored in [migrations](../migrations/).

The migration framework being used is [db-migrate](https://www.npmjs.com/package/db-migrate) and in order for it to
work you will need to copy `database.json.template` to `database.json` and then change the applicable settings to
match your database setup.

To use these migration scripts you can run `npm run migrate up` to apply the changes to your database. You also have
the option to undo the changes by running `npm run migrate down`.
