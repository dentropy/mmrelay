``` bash

cd my-schema
cd database
docker compose up -d

docker-compose down --volumes

```


``` bash

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING -f ./schema.sql

export PG_CONN_STRING="postgres://postgres:postgres@localhost:5433/postgres"
psql $PG_CONN_STRING -f ./database/delete.sql


export PG_CONN_STRING="postgres://postgres:postgres@127.0.0.1:5433/postgres"
export PGHOST=127.0.0.1
export PGPORT=5433
export PGDATABASE=postgres
export PGUSERNAME=postgres
export PGPASSWORD=postgres

``` 


``` SQL

select * from nostr_event_on_relay;
select * from nostr_events where kind = 1;
select * from simple_nostr_scraping_logs order by created_at desc;
select * from non_standard_nostr_event_tags nsnet ;
select * from nostr_event_tags;

```


#### Example Insert Statements

``` SQL

INSERT INTO nostr_events (
    event_id,
    created_at,
    kind,
    raw_event
) VALUES (
    'event_id_001',
    1745147093,
    1,
    '{"id":"bbbadb30508c23a2d0fa051a3eb077c67326c4823c8603d3ce632c333803a519","pubkey":"ca381d7d41835b006618b56e90cfa219f89449e7d18b68a699112a1a8471ab1f","kind":1,"content":"Baby Tasmanian devils\n\nhttps://v.nostr.build/WgNWwWb3RNV3GM7r.mp4","tags":[["imeta","url https://v.nostr.build/WgNWwWb3RNV3GM7r.mp4","blurhash e01VoKof00Rj~qj[fQayfQj[00WB~qt700ayfQj[fQay~qj[00Rj~q","dim 640x640"],["r","https://v.nostr.build/WgNWwWb3RNV3GM7r.mp4"]],"sig":"ef4d2144a3b1028c31640e4c81c67a28bc89120973d1ff6b2f04cabc9b1c41b4d9bc66b2c320af8d5e69d5eaaefebbbdc81b2294526d9d5aaa63578ee931e7e2","created_at":1745147093}'
) ON CONFLICT (event_id) DO NOTHING;



INSERT INTO nostr_events (
    event_id,
    created_at,
    kind,
    raw_event
) VALUES (
    'event_id_002',
    1745147093,
    1,
    '{"id":"bbbadb30508c23a2d0fa051a3eb077c67326c4823c8603d3ce632c333803a519","pubkey":"ca381d7d41835b006618b56e90cfa219f89449e7d18b68a699112a1a8471ab1f","kind":1,"content":"Baby Tasmanian devils\n\nhttps://v.nostr.build/WgNWwWb3RNV3GM7r.mp4","tags":[["imeta","url https://v.nostr.build/WgNWwWb3RNV3GM7r.mp4","blurhash e01VoKof00Rj~qj[fQayfQj[00WB~qt700ayfQj[fQay~qj[00Rj~q","dim 640x640"],["r","https://v.nostr.build/WgNWwWb3RNV3GM7r.mp4"]],"sig":"ef4d2144a3b1028c31640e4c81c67a28bc89120973d1ff6b2f04cabc9b1c41b4d9bc66b2c320af8d5e69d5eaaefebbbdc81b2294526d9d5aaa63578ee931e7e2","created_at":1745147093}'
) ON CONFLICT (event_id) DO NOTHING;

```
#### Job Queue Querries

``` sql

INSERT INTO nostr_scraping_jobs (
    activity_name,
    activity_input,
    activity_status
) VALUES (
    'scrape.nip05.0.0.1',
    '{"note": "Preferred customer"}',
    'TODO'
);

select * from nostr_scraping_jobs;

INSERT INTO nostr_scraping_jobs (
    activity_name,
    activity_input,
    activity_status
) VALUES (
    'scrape.nip05.0.0.1',
    '{"internet_identifier": "fiatjaf@fiatjaf.com"}',
    'TODO'
);

select * from nostr_scraping_jobs;

UPDATE nostr_scraping_jobs
SET 
    activity_status = 'Running',
    worker_id = 'worker001'
WHERE job_id = (
    SELECT job_id
    FROM nostr_scraping_jobs
    WHERE 
        activity_status = 'TODO'
        and activity_name in (
            'scrape.pubkey.from.relay.0.0.1',
            'scrape.replies.to.thread.from.relay.0.0.1',
            'scrape.reactions.to.thread.from.relay.0.0.1',
            'scrape.reactions.to.thread.from.relay.0.0.1',
            'scrape.follows.of.pubkey.from.relay.0.0.1',
            'scrape.badges.to.publey.from.relay.0.0.1',
            'scrape.nip05.0.0.1'
        )
    ORDER BY created_at DESC
    LIMIT 1
)
RETURNING *;

select * from nostr_scraping_jobs;

```

#### Scrape pubkey from Specific Relay

``` SQL

INSERT INTO nostr_scraping_jobs (
    activity_name,
    activity_input,
    activity_status,
    activity_type,
    activity_input_hash,
) VALUES (
    'scrape_pubkey_from_specific_relay',
    '{
      "authors": ["2cd173ccf1b7fdf150177961442091e3c0273fd96d815113d8fefe24efcd65f8"],
      "relays": ["wss://relay.mememaps.net"],
	  "limit": 3
    }',
    'TODO',
    'WORKFLOW',
);

select * from nostr_scraping_jobs;
```

## Queries

``` sql

SELECT DISTINCT data->>'pubkey'
FROM nostr_events
WHERE data ? 'pubkey';

select distinct pubkey from nostr_events;

select count(distinct pubkey) from nostr_events;

```

#### Nosdump

``` bash

nosdump -k 0 wss://relay.damus.io > ScrapedData/relay-relay.damus.io-kind-0.jsonl

```

#### Loading in a Job

``` SQL

CREATE TABLE IF NOT EXISTS scraping_nostr_filters_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scraping_status VARCHAR,
    number_of_results INT,
    filter_json JSONB,
    metadata JSONB,
    num_results INTEGER,
    relay_url VARCHAR,
    since INTEGER,
    until INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
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