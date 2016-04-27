# Authentication Setup
The admin interface authenticates with the back end to check whether a user has admin permissions.

Electron release server supports a couple authentication methods out of the box.
You must specify configuration details for at least one of them in the `config/local.js` in the `auth` sub object.

If you do not wish to use an authentication method, ensure that it's config sub object is not present in the aforementioned config file.

## Supported methods
### Static
Authenticates credentials against a single username/password pair.

If enabled this will take precedence over other enabled methods.
#### Config
```js
static: {
  username: 'STATIC_USERNAME',
  password: 'STATIC_PASSWORD'
}
```

### LDAP
Authenticates credentials against an LDAP service, optionally filtering results (ex. only a given group has access).

#### Config
```js
ldap: {
 usernameField: 'USERNAME_FIELD', // Key at which the username is stored
 server: {
   url: 'ldap://LDAP_SERVER_FQDN:389',
   bindDn: 'INSERT_LDAP_SERVICE_ACCOUNT_USERNAME_HERE',
   bindCredentials: 'INSERT_PASSWORD_HERE',
   searchBase: 'USER_SEARCH_SPACE', // ex: ou=Our Users,dc=companyname,dc=com
   searchFilter: '(USERNAME_FIELD={{username}})'
 }
}
```

### Custom
There is a good chance that you will want to modify the authentication method used to match your needs.

Please consider making said changes in a fork and opening a PR so that everyone can benefit from your work.

You can do so by modifying the file found here: `api/services/AuthService.js`.
