CREATE TABLE IF NOT EXISTS nostr_events (
    event_id VARCHAR NOT NULL UNIQUE,
    created_at INTEGER NOT NULL UNIQUE,
    kind integer NOT NULL UNIQUE,
    pubkey VARCHAR,
    sig VARCHAR,
    content VARCHAR,
    content_sha256 VARCHAR,
    content_is_json BOOLEAN,
    content_json JSONB,
    raw_event VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS nostr_event_on_relay (
    event_id VARCHAR,
    relay_url VARCHAR,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nostr_event_relay_metadata
        FOREIGN KEY (event_id)
        REFERENCES nostr_events (event_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS nostr_event_tags (
    event_id VARCHAR,
    first_tag VARCHAR,
    tags JSONB,
    CONSTRAINT fk_nostr_event_tags
        FOREIGN KEY (event_id)
        REFERENCES nostr_events (event_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS non_standard_nostr_event_tags (
    event_id VARCHAR,
    first_tag VARCHAR,
    tags JSONB,
    CONSTRAINT fk_non_standard_nostr_event_tags
        FOREIGN KEY (event_id)
        REFERENCES nostr_events (event_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS nip05_metadata (
    pubkey VARCHAR,
    username VARCHAR,
    domain_name VARCHAR,
    internet_identifier VARCHAR,
    relays JSONB,
    raw_result VARCHAR,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nostr_scraping_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR,
    job_input JSON,
    job_status VARCHAR,
    job_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nostr_scraping_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID,
    job_name VARCHAR,
    job_input JSONB,
    job_result JSONB,
    job_previous_status VARCHAR,
    job_updated_status VARCHAR,
    log_ingested_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
