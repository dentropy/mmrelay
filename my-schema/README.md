``` bash

docker-compose down --volumes

```

``` bash

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"

psql $PG_CONN_STRING

psql $PG_CONN_STRING -f ./schema.sql