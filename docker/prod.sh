#!/bin/sh

docker compose -f compose.yaml -f compose.prod.yaml up --build $@
