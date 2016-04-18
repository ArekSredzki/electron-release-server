# Deployment

Electron Release Server can be easily be deployed to your own server.

### On your own server:

Install dependencies using:

```
$ npm install
```

**Action Step:** You must create a `config/local.js` file, which contains the configuration options required to run the server.

To assist this process, you can copy `config/local.template` and edit it using:
```bash
cp config/local.template config/local.js
vim config/local.js
```

Then start the application using:

```
$ npm start
```

Browse to `http://localhost:1337/`

## PostgreSQL Specific Instructions
If you choose to use PostgreSQL as your database for sessions, ensure that you follow the instructions listed [sails-pg-session](https://github.com/ravitej91/sails-pg-session).
You must install some functions in your database for it to work for you.
