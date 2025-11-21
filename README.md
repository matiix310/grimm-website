# Grimm Docker infrastructure

This repository host the Grimm BDE docker infrastructure. Grimm is a list for the [EPITA](https://epita.fr) BDE. You can find the website at https://bde-grimm.com.

## Environment Variables

To run this project, you will need to add the following environment variables

### `./docker/.env`

| Variable                        | Description                    | Example value |
| :------------------------------ | :----------------------------- | :------------ |
| POSTGRES_DB                     | Name of the database           | grimm         |
| POSTGRES_USER                   | Default admin user             | postgres      |
| POSTGRES_PASSWORD               | Default admin password         | password      |
| DRIZZLE_GATEWAY_MASTER_PASSWORD | Drizzle Gateway admin password | password      |

### `./website/.env`

| Variable               | Description                                         | Example value                                                    |
| :--------------------- | :-------------------------------------------------- | :--------------------------------------------------------------- |
| DB_URL                 | Url to connect to the database (from the container) | postgresql://postgres:password@db:5432/grimm                     |
| DEV_DB_URL             | Url to connect to the database (from the host)      | postgresql://postgres:password@localhost:5432/grimm              |
| BETTER_AUTH_SECRET     | Internal Better-auth random secret                  | 1234                                                             |
| BASE_URL               | Public URL of the website                           | http://localhost                                                 |
| FORGE_ID_CLIENT_ID     | Forge OIDC client id                                | 125070                                                           |
| FORGE_ID_CLIENT_SECRET | Forge OIDC client secret                            | f6ff8d394e6185d41834b19210979b897852680cf34700ae4ecb24ea         |
| S3_URL                 | URL of the S3 server                                | http://s3.localhost                                              |
| S3_ACCESS_KEY_ID       | S3 access key ID                                    | GKa5e5593902d055847e554e03                                       |
| S3_SECRET_ACCESS_KEY   | S3 secrect access key                               | eaa2448604c954a7b6721874ed0ec4a0397dd093c0199258d12a991f169aec82 |
| S3_BUCKET_NAME         | S3 bucket name                                      | grimm-bucket                                                     |

## Deployment

To deploy this project with docker compose run:

```bash
  cd docker
  docker compose -f compose.yaml -f compose.prod.yaml up --build
```

## Development

This project include a custom docker compose configuration that enables hot reload of the website. Each saved file will sync into the docker and automatically refresh the page.

To run the project in development mode run:

```bash
  cd docker
  docker compose -f compose.yaml -f compose.dev.yaml up --build --watch
```

You can then connect to http://localhost.

In development mode, you have access to the `drizzle-gateway` instance running on port `4983`. With it you can explore the currently running database: http://localhost:4983.

## Setup Garage instance (S3)

For the following step to work, the docker yould be running and named docker-garage-1 (see in `docker ps`).

First get the id of the node you want to use with:

```bash
  cd docker
  docker exec -it docker-garage-1 /garage status
```

Then execute the following command, replacing <NODE_ID> and <SIZE> with the desired node ID and size (example: 100G):

```bash
  docker exec -it docker-garage-1 /garage layout assign -z dc1 -c <SIZE> <NODE_ID>
  docker exec -it docker-garage-1 /garage layout apply --version 1
  docker exec -it docker-garage-1 /garage bucket create grimm-bucket
```

Finally, you will create a key and give it the permission to read and write to the bucket `grimm-bucket`:

```bash
  docker exec -it docker-garage-1 /garage key create grimm-key
  docker exec -it docker-garage-1 /garage bucket allow --read --write --owner grimm-bucket --key grimm-key
```

Don't forget to place the given key ID and secret into the `website/.env` file as `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`.

## Architecture

```
.
├── docker    # docker related files
└── website   # nextjs website
```
