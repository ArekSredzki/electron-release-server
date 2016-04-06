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
