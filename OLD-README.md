# CHECK OUT https://github.com/dentropy/nostr-daemon/tree/master/docker/relays to run these relays

# CHECK OUT https://github.com/dentropy/nostr-daemon/tree/master/docker/relays to run these relays

# CHECK OUT https://github.com/dentropy/nostr-daemon/tree/master/docker/relays to run these relays

# nostr-rs-relay

``` bash

export ERD_PATH='./nostr-rs-relay'
export PROJECT_NAME='nostr-rs-relay'
export SQLITE_PATH="$(pwd)/build/nostr-rs-relay/data/nostr.db"
export SQLITE_URL=sqlite:///$SQLITE_PATH


mkdir $ERD_PATH
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.pdf
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.md
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.png
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.jpg
sqlite3 $SQLITE_PATH .schema > $ERD_PATH/$PROJECT_NAME.sql

```

# nostr-relay-sqlite

``` bash

export ERD_PATH='./nostr-relay-sqlite'
export PROJECT_NAME='nostr-relay-sqlite'
export SQLITE_PATH="$(pwd)/build/nostr-relay-sqlite/nostr.db"
export SQLITE_URL=sqlite:///$SQLITE_PATH


mkdir $ERD_PATH
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.pdf
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.md
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.png
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.jpg
sqlite3 $SQLITE_PATH .schema > $ERD_PATH/$PROJECT_NAME.sql

```

# khatru

``` bash

export ERD_PATH='./hkatru'
export PROJECT_NAME='hkatru'
export SQLITE_PATH="$(pwd)/build/hkatru/nostr.sqlite"
export SQLITE_URL=sqlite:///$SQLITE_PATH


mkdir $ERD_PATH
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.pdf
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.md
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.png
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.jpg
sqlite3 $SQLITE_PATH .schema > $ERD_PATH/$PROJECT_NAME.sql

```

# nostream

``` bash

export POSTGRES_HOST=127.0.0.1
export POSTGRES_PORT=5434
export POSTGRES_DB=nostr_ts_relay
export POSTGRES_USER=nostr_ts_relay
export POSTGRES_PASSWORD=nostr_ts_relay
export POSTGRES_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTRS_DB}"
export POSTGRES_URL_ALCHEMY="postgresql+psycopg2://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTRS_DB}"

mkdir $ERD_PATH
eralchemy2 -i $POSTGRES_URL_ALCHEMY -o $ERD_PATH/$PROJECT_NAME.pdf
eralchemy2 -i $POSTGRES_URL_ALCHEMY -o $ERD_PATH/$PROJECT_NAME.md
eralchemy2 -i $POSTGRES_URL_ALCHEMY -o $ERD_PATH/$PROJECT_NAME.png
eralchemy2 -i $POSTGRES_URL_ALCHEMY -o $ERD_PATH/$PROJECT_NAME.jpg

docker exec -it nostream-db pg_dump -U $POSTGRES_USER --schema-only > $ERD_PATH/$PROJECT_NAME.sql

```

#### ftsrelay

``` bash

export ERD_PATH='./ftsrelay'
export PROJECT_NAME='ftsrelay'
export SQLITE_PATH="$(pwd)/build/ftsrelay/relay.sqlite"
export SQLITE_URL=sqlite:///$SQLITE_PATH
sqlite3 $SQLITE_PATH .schema > $ERD_PATH/$PROJECT_NAME.sql

grep -v 'fts5' $ERD_PATH/$PROJECT_NAME.sql > $ERD_PATH/$PROJECT_NAME.NO_fts5.sql
# Additional Troubleshooting is nessesary

rm /tmp/ftsrelay.db
sqlite3 /tmp/ftsrelay.db < $ERD_PATH/$PROJECT_NAME.NO_fts5.sql

export SQLITE_URL=sqlite:////tmp/ftsrelay.db
eralchemy2 -i sqlite:////tmp/ftsrelay.db -o $ERD_PATH/$PROJECT_NAME.pdf

eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.md
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.png
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.jpg


mkdir $ERD_PATH
plant_erd sqlite3 --database $SQLITE_PATH 
sqlite3 $SQLITE_PATH .schema > $ERD_PATH/$PROJECT_NAME.sql

```

#### nistr-relay-pip


``` bash

export ERD_PATH='./nostr-relay-pip'
export PROJECT_NAME='nostr-relay-pip'
export SQLITE_PATH="$(pwd)/build/nostr.sqlite3"
export SQLITE_URL=sqlite:///$SQLITE_PATH


mkdir $ERD_PATH
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.pdf
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.md
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.png
eralchemy2 -i $SQLITE_URL -o $ERD_PATH/$PROJECT_NAME.jpg
sqlite3 $SQLITE_PATH .schema > $ERD_PATH/$PROJECT_NAME.sql

```