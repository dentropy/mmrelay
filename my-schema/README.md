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