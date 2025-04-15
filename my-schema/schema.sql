CREATE TABLE IF NOT EXISTS nostr_events (
    event_id VARCHAR NOT NULL UNIQUE,
    created_at INTEGER NOT NULL UNIQUE,
    kind integer NOT NULL UNIQUE,
    pubkey VARCHAR,
    sig VARCHAR,
    content VARCHAR,
    raw_event VARCHAR NOT NULL UNIQUE,
    is_verified BOOLEAN
);

-- content_sha256 VARCHAR,
-- content_is_json BOOLEAN,
-- content_json JSONB,

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
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_name VARCHAR NOT NULL,
    activity_input JSONB,
    activity_input_hash VARCHAR,
    activity_output JSONB,
    activity_output_hash VARCHAR,
    activity_status VARCHAR NOT NULL,
    num_retries INTEGER,
    worker_id VARCHAR,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nostr_scraping_job_dependencies (
    activity_id UUID,
    dependent_activity_id UUID,
    CONSTRAINT fk_nostr_scraping_job_dependencies_activity_id
        FOREIGN KEY (activity_id)
        REFERENCES nostr_scraping_jobs (activity_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    CONSTRAINT fk_nostr_scraping_job_dependencies_dependent_activity_id
        FOREIGN KEY (dependent_activity_id)
        REFERENCES nostr_scraping_jobs (activity_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_on_nostr_scraping_jobs
BEFORE UPDATE ON nostr_scraping_jobs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- --- TODO
CREATE TABLE IF NOT EXISTS nostr_scraping_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID,
    activity_name VARCHAR,
    activity_input JSONB,
    activity_input_hash VARCHAR,
    activity_output JSONB,
    activity_output_hash VARCHAR,
    activity_previous_status VARCHAR,
    activity_updated_status VARCHAR,
    log_ingested_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
