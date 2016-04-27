# Deployment

Electron Release Server can be easily be deployed to your own server.

## General Configuration:

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
npm start
```

Browse to `http://localhost:1337/`

## Database setup
See the [database setup guide](database.md).

## Authentication
See the [authentication guide](authentication.md).

## Deployment
See the [Sails deployment documentation](http://sailsjs.org/documentation/concepts/deployment).

To start the server in deployment mode use:
```
npm start --prod
```

> Note: In production you should use a process manager such as [pm2](http://pm2.keymetrics.io/)
