#!/bin/bash

if [ -z "$PG_CONN_STRING" ]; then
  export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
else
  echo "Using default PG_CONN_STRING"
fi
echo "PG_CONN_STRING is set to $PG_CONN_STRING"
# echo "Running delete.sql script"
# psql $PG_CONN_STRING -f ./database/delete.sql
echo "Running drop.sql script"
psql $PG_CONN_STRING -f ./database/drop.sql
echo "Running schema.sql script"
psql $PG_CONN_STRING -f ./database/schema.sql
