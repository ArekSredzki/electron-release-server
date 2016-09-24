# Docker

Electron Release Server have `Dockerfile` and `docker-compose.yml`.
So, you can use [docker](https://www.docker.com/) and [docker-compose](https://github.com/docker/compose).

## Requirements

Install [docker](https://www.docker.com/) and [docker-compose](https://github.com/docker/compose).

## Localserver
To easily run localserver you should at first set `SECRET` environment variable:

```bash
$ export SECRET='secret'
$ docker-compose up -d
$ # open locahost:5000 in browser
```

If you use [docker-machine](https://github.com/docker/machine) you should change
`APP_URL` at `docker-compose.yml` to address to your docker-machine.

## Configurations

To run the single container provide the next environment variables:

- `APP_USERNAME`, `APP_PASSWORD` – static username and password for authentication ref.
- `DB_HOST` – hostname of postgres
- `DB_PORT` – port of postgres
- `DB_USERNAME`, `DB_PASSWORD` – credentials to access postgres
- `DB_NAME` – Database name
- `SECRET` – Recommended: 63 random alpha-numeric characters
- `APP_URL` - base url for the app - [ref](http://sailsjs.org/documentation/reference/application/sails-get-base-url)

Also, one set `NODE_ENV` to `"production"` to force use `production` config – so you should not
set the environment variables: `APP_USERNAME`, `APP_PASSWORD`, `DB_HOST`,  `DB_PORT`,
`DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `SECRET`.


