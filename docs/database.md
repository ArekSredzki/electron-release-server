# Database Setup
The following is a recommended database setup process.

## Prerequisites
Before you continue, you will need to have an instance on the PostgresSQL database running on a host. 

You will additionally need to have the following details handy:
- Host name
- The username & password for an account with privileges to create a user, create a database & assign a user to the database.

If you need help installing the database, the following link contains detailed [installaing guides](https://wiki.postgresql.org/wiki/Detailed_installation_guides).

For example, after a Windows installation of postgres, I needed to run the following commands
```
C:\Program Files\PostgreSQL\9.5\bin>psql.exe --username=postgres
Password for user postgres:
psql (9.5.2)
WARNING: Console code page (437) differs from Windows code page (1252)
         8-bit characters might not work correctly. See psql reference
         page "Notes for Windows users" for details.
Type "help" for help.

postgres=# CREATE ROLE electron_release_server_user ENCRYPTED PASSWORD 'MySecurePassword' LOGIN;
CREATE ROLE
postgres=# CREATE DATABASE electron_release_server OWNER "electron_release_server_user";
CREATE DATABASE
postgres=# CREATE DATABASE electron_release_server_sessions OWNER "electron_release_server_user";
CREATE DATABASE
postgres=#
``` 

## PostgreSQL
Using the details listed in the prerequisites, connect to the postgres database using psql ([PostgreSQL interactive terminal](http://www.postgresql.org/docs/9.2/static/app-psql.html)).  

You now need to create dedicated a postgres role
```sql
CREATE ROLE electron_release_server_user ENCRYPTED PASSWORD '<PASSWORD>' LOGIN;
```
> Hint: if you need a password, use this https://www.grc.com/passwords.htm
>
> (63 random alpha-numeric characters)

Create databases for role
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
        database: 'electron_release_server',
        host: 'localhost',
        user: 'electron_release_server_user',
        password: 'MySecurePassword',
        port: 5432
    }
```

### Session adapter requirements
Originally described [here](https://github.com/ravitej91/sails-pg-session)

```bash
psql electron_release_server_sessions < ./sql/sails-pg-session-support.sql postgres
```
> Hint: Use the same **process** as mentioned above to generate the session & JWT secret keys stored in `config/local.js`

