# Database Setup
The following is a recommended database setup process.

## PostgreSQL
Create dedicated postgres role
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

### Session adapter requirements
Originally described [here](https://github.com/ravitej91/sails-pg-session)

```bash
psql electron_release_server_sessions < ./sql/sails-pg-session-support.sql
```
> Hint: Use the same **process** as mentioned above to generate the session & JWT secret keys stored in `config/local.js`
