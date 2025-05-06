# Dentropy's Nostr Relay

## Description

This is a Nostr relay that also has the capacity to scrape other Nostr relays and log when they are storing which events.

## Install

``` bash
git clone git@github.com:dentropy/nostr-sql-survey.git
cd nostr-sql-survey
cd my-schema
cd database
docker compose up -d

docker-compose down --volumes

```


``` bash

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING

psql $PG_CONN_STRING -f ./database/schema.sql
psql $PG_CONN_STRING -f ./database/delete.sql

nosdump wss://relay.damus.io > ./scrapedData/data.jsonnl

node ./nosdump-ingest.js ./scrapedData/data.jsonnl
``` 


``` SQL

select * from normalized_nostr_events_t;
select count(*) from normalized_nostr_events_t;

select * from nostr_event_on_relay_t;
select count(*) from nostr_event_on_relay_t;

select * from scraping_nostr_filters_t;

select * from nostr_filter_scraping_logs_t;
select count(*) from nostr_filter_scraping_logs_t;

```


#### Loading in a Job

``` SQL

INSERT INTO scraping_nostr_filters_t (
    scraping_status,
    filter_json,
    metadata,
    num_results,
    relay_url,
    since,
    incrementer,
    until
) VALUES (
    'TODO',                       -- scraping_status
    '{}',                         -- filter_json
    '{}',                         -- metadata
    0,                            -- num_results
    'wss://relay.mememaps.net',   -- relay_url
    1745107200,                   -- since (Jan 1st 2020)
    3600,                         -- incrementer of an hour
    1577836800                    -- until (April 20th 2025)
);


INSERT INTO scraping_nostr_filters_t (
    scraping_status,
    filter_json,
    metadata,
    num_results,
    relay_url,
    since,
    incrementer,
    until
) VALUES (
    'TODO',                       -- scraping_status
    '{"ids": [
    "601ca9541eaaa842466d09ad1cf019c727d6bd98beb3468283c8777dc875e0f6","bee4a296e6b00bb31782e8a0984e507a603764b0073cbdfa957aa587ba8ba093",
    "1c6c90a3d2a3142e71cb5e6d6de397538e25e147ab440b4b73739d0a7bfbaa4f",
    "a7ff8b3812f0e160e62835b1ce58198f8e4abcc30059c8af0aff5c23f59b8eb9",
    "dd7568d56693cad9fa52ec862322c27fcd16affb225a53ed946a2a392a0ab83f",
    "2b0bd432224abedb8fca6f7811e3e9fd2221b5ec788caf0f45fb1bf8d4bb7af5",
    "1618a1bf31174b7204d114e237b3e8ccbe9455593d210bbc076cbf3d745af7ad",
    "adbf5a62edc33b52491b00d6b1c8ed1c8c77a492d9ad0090bea67df1f172e029",
    "80088f14236ab6233b5fbac46a4d347d0435db3211c23166210318938e1380fa",
    "6aa6804a59d6ee88bf9d344c989f3017689c8c23b359687a8250eb59b9db5566",
    "4b248d28c54efbee771a4d598326970b7e4c06584ce0a6f0bd2363f916294cf4",
    "fe5614bc28890d3b828dba1ab031f797eb0768c546ace5f30e87c9bd4a66fea3"]}',                         -- filter_json
    '{}',                         -- metadata
    0,                            -- num_results
    'wss://relay.mememaps.net',   -- relay_url
    1745107200,                   -- since (Jan 1st 2020)
    3600,                         -- incrementer of an hour
    1577836800                    -- until (April 20th 2025)
);


UPDATE scraping_nostr_filters_t
SET 
    scraping_status = 'RUNNING'
WHERE id = (
    SELECT id
    FROM scraping_nostr_filters_t
    WHERE 
        scraping_status = 'TODO'
    ORDER BY created_at DESC
    LIMIT 1
)
RETURNING *;
```
