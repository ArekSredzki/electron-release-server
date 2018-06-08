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

## Using Nginx

If you want to use nginx as web-server:

```nginx
server {
    listen       80;
    server_name  download.yourdomain.com;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Nginx-Proxy true;

        proxy_pass http://127.0.0.1:1337/;
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

Browse to `http://download.yourdomain.com/`

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
