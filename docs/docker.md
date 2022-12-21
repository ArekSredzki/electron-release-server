# Docker

Electron Release Server has a `Dockerfile` and a `docker-compose.yml`file.
So, you can use [docker](https://www.docker.com/) and [docker-compose](https://github.com/docker/compose).

## Requirements

Install [docker](https://www.docker.com/) and [docker-compose](https://github.com/docker/compose).

## Localserver

```bash
docker-compose up
# open localhost:8080 in browser
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
- `DATA_ENCRYPTION_KEY` - DEKs should be 32 bytes long, and cryptographically random.
  You can generate such a key by running the following:
  ```
  require('crypto').randomBytes(32).toString('base64')
  ```
- `TOKEN_SECRET` – Recommended: 63 random alpha-numeric characters
- `APP_URL` - base url for the app - [ref](http://sailsjs.org/documentation/reference/application/sails-get-base-url)

To use `production.js` set `NODE_ENV` to `"production"` – so you should not set the environment variables:
`APP_USERNAME`, `APP_PASSWORD`, `DB_HOST`, `DB_PORT`,
`DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `TOKEN_SECRET`.

**Warning**: You can insert the `APP_PASSWORD`, `DB_PASSWORD`, `TOKEN_SECRET`, and `DATA_ENCRYPTION_KEY` directly into
the `docker-compose.yml`, but this is not advised since it makes it easy to accidentally publish your secretms.
The production secrets must not be committed publicly!

## How to run

For your first run, you should start with development settings (which are the default) since this will perform database initialization/migration.

For all subsequent executions, you should run in production mode by setting `NODE_ENV` to `"production"`.
