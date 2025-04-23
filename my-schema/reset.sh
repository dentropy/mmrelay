#!/bin/bash

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING -f ./database/delete.sql

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING -f ./schema.sql
