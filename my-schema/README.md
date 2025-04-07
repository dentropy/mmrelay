``` bash

docker-compose down --volumes

```


``` bash

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING -f ./schema.sql

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING -f ./database/delete.sql

``` 


#### Job Queue Querries

``` sql
INSERT INTO nostr_scraping_jobs (
    job_name,
    job_input,
    job_status
) VALUES (
    'John',
    '{"note": "Preferred customer"}',
    'TODO'
);

select * from nostr_scraping_jobs;

UPDATE nostr_scraping_jobs
SET job_status = 'Running'
WHERE job_id = (
    SELECT job_id
    FROM nostr_scraping_jobs
    WHERE job_status = 'TODO'
    ORDER BY created_at DESC
    LIMIT 1
)
RETURNING *;

select * from nostr_scraping_jobs;

```