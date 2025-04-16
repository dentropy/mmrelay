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


``` SQL

select * from nostr_event_on_relay;
select * from nostr_events where kind = 1;
select * from simple_nostr_scraping_logs order by created_at desc;
select * from non_standard_nostr_event_tags nsnet ;
select * from nostr_event_tags;

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
