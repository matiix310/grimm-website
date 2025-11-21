# Grimm Docker infrastructure

This repository host the Grimm BDE docker infrastructure. Grimm is a list for the [EPITA](https://epita.fr) BDE. You can find the website at https://bde-grimm.com.

## Environment Variables

To run this project, you will need to create `./website/.env` and `./docker/.env`. An example is named `env.template` for both of them. Read its content and copy it to `.env` before starting the containers.

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
