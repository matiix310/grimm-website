# Grimm Docker infrastructure

This repository host the Grimm BDE docker infrastructure. Grimm is the current [EPITA](https://epita.fr) BDE. You can find the website at https://bde-grimm.com.

## Environment Variables

To run this project, you will need to add the following environment variables

### `./docker/db.env`

| Variable          | Description            | Example value |
| :---------------- | :--------------------- | :------------ |
| POSTGRES_DB       | Name of the database   | grimm         |
| POSTGRES_USER     | Default admin user     | postgres      |
| POSTGRES_PASSWORD | Default admin password | password      |

### `./website/.env`

| Variable               | Description                        | Example value                                |
| :--------------------- | :--------------------------------- | :------------------------------------------- |
| DB_URL                 | Url to connect to the database     | postgresql://postgres:password@db:5432/grimm |
| BETTER_AUTH_SECRET     | Internal Better-auth random secret | 1234                                         |
| BASE_URL               | Public URL of the website          | http://localhost:8000                        |
| FORGE_ID_CLIENT_ID     | Forge OIDC client id               | 1234                                         |
| FORGE_ID_CLIENT_SECRET | Forge OIDC client secret           | 1234                                         |

## Deployment

To deploy this project with docker compose run:

```bash
  cd docker
  docker compose up
```

## Development

This project include a custom docker compose configuration that enables hot reload of the website. Each saved file will sync into the docker and automatically refresh the page.

To run the project in development mode run:

```bash
  cd docker
  docker compose -f compose.yaml -f compose.dev.yaml up --watch
```

In development mode, you have access to an `adminer` instance running on port `8080`. With it you can explore the currently running database: http://localhost:8080.

## Architecture

```
.
├── docker    # docker related files
└── website   # nextjs website
```
