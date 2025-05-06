CREATE TABLE IF NOT EXISTS normalized_nostr_events_t (
    id VARCHAR NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    kind integer NOT NULL,
    pubkey VARCHAR NOT NULL,
    sig VARCHAR,
    content VARCHAR,
    tags TEXT,
    num_tags INTEGER,
    raw_event VARCHAR,
    is_verified BOOLEAN
);

--- Doesn't work cause many tags are too long max number of bytes is 8191
--- CREATE INDEX normalized_nostr_events_t_tags_column ON normalized_nostr_events_t ( tags );

CREATE TABLE IF NOT EXISTS nostr_event_tags_t (
    id VARCHAR,
    first_tag VARCHAR,
    tags TEXT,
    CONSTRAINT fk_nostr_event_relay_metadata
        FOREIGN KEY (id)
        REFERENCES normalized_nostr_events_t (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS non_standard_nostr_event_tags_t (
    id VARCHAR,
    first_tag VARCHAR,
    tags JSONB,
    CONSTRAINT fk_non_standard_nostr_event_tags
        FOREIGN KEY (id)
        REFERENCES normalized_nostr_events_t (id)
        ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION insert_nostr_event_tags()
RETURNS TRIGGER AS $$
DECLARE
    nested_tags JSONB;
    item JSONB;
    first_tag_extracted VARCHAR;
BEGIN
    -- Loop through the JSONB array 'tags' from the NEW record
    FOR item IN
        SELECT jsonb_array_elements(NEW.raw_event::jsonb->'tags') AS tag
    LOOP
        -- Check if the tag matches the pattern
        first_tag_extracted := item::jsonb->>0;
        IF first_tag_extracted ~ '^[A-Za-z]{1,2}$' THEN
            -- Insert into nostr_event_tags
            INSERT INTO nostr_event_tags_t (
                id,
                first_tag,
                tags
            ) VALUES (
                NEW.id,
                first_tag_extracted,  -- Insert the tag directly
                item::jsonb
            );
        ELSE
            -- Insert into non_standard_nostr_event_tags
            INSERT INTO non_standard_nostr_event_tags_t (
                id,
                first_tag,
                tags
            ) VALUES (
                NEW.id,
                first_tag_extracted,  -- Insert the tag directly
                item
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER run_insert_nostr_event_tags_on_normalized_nostr_events
AFTER INSERT ON normalized_nostr_events_t
FOR EACH ROW
EXECUTE PROCEDURE insert_nostr_event_tags();

-- Logging and Scraping Management
CREATE TABLE IF NOT EXISTS scraping_nostr_filters_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scraping_status VARCHAR,
    filter_json JSONB,
    metadata JSONB,
    num_results INTEGER,
    relay_url VARCHAR,
    since INTEGER,
    until INTEGER,
    incrementer INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nostr_filter_scraping_logs_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scraped_nostr_filter_id UUID,
    filter_json JSONB,
    metadata JSONB,
    num_results INTEGER,
    relay_url VARCHAR,
    since INTEGER,
    until INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    log_data TEXT
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_on_nostr_scraping_jobs
BEFORE UPDATE ON nostr_filter_scraping_logs_t
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Relay Metadata Stuff

CREATE TABLE IF NOT EXISTS nostr_event_on_relay_t (
    id VARCHAR,
    relay_url VARCHAR,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logging_uuid VARCHAR,
    CONSTRAINT fk_nostr_event_relay_metadata
        FOREIGN KEY (id)
        REFERENCES normalized_nostr_events_t (id)
);

-- To Actually Start Using

CREATE TABLE IF NOT EXISTS nip05_metadata_t (
    pubkey VARCHAR,
    username VARCHAR,
    domain_name VARCHAR,
    internet_identifier VARCHAR,
    relays JSONB,
    raw_result VARCHAR,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nostr_event_content_indexed (
    id VARCHAR not NULL,
    title VARCHAR,
    content TEXT,
    summary TEXT,
    CONSTRAINT fk_non_standard_nostr_event_tags
        FOREIGN KEY (id)
        REFERENCES normalized_nostr_events_t (id)
        ON DELETE CASCADE
);
ALTER TABLE nostr_event_content_indexed
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, ''))) STORED;
CREATE INDEX nostr_event_content_index ON nostr_event_content_indexed USING gin(search_vector);

-- CREATE TABLE IF NOT EXISTS nostr_events (
--     event_id VARCHAR NOT NULL UNIQUE,
--     created_at INTEGER NOT NULL,
--     kind integer NOT NULL,
--     pubkey VARCHAR,
--     sig VARCHAR,
--     content VARCHAR,
--     raw_event VARCHAR NOT NULL,
--     is_verified BOOLEAN
-- );

-- CREATE TABLE IF NOT EXISTS raw_nostr_events (
--     raw_event JSONB UNIQUE
-- );




-- CREATE TRIGGER run_insert_nostr_event_tags
-- AFTER INSERT ON nostr_events
-- FOR EACH ROW
-- EXECUTE PROCEDURE insert_nostr_event_tags();


-- content_sha256 VARCHAR,
-- content_is_json BOOLEAN,
-- content_json JSONB,


-- CREATE TABLE IF NOT EXISTS nostr_scraping_jobs (
--     activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     activity_name VARCHAR NOT NULL,
--     activity_input JSONB,
--     activity_input_hash VARCHAR,
--     activity_output JSONB,
--     activity_output_hash VARCHAR,
--     activity_status VARCHAR NOT NULL,
--     num_retries INTEGER,
--     worker_id VARCHAR,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS nostr_scraping_job_dependencies (
--     activity_id UUID,
--     dependent_activity_id UUID,
--     CONSTRAINT fk_nostr_scraping_job_dependencies_activity_id
--         FOREIGN KEY (activity_id)
--         REFERENCES nostr_scraping_jobs (activity_id)
--         ON DELETE CASCADE
--         ON UPDATE CASCADE
--     CONSTRAINT fk_nostr_scraping_job_dependencies_dependent_activity_id
--         FOREIGN KEY (dependent_activity_id)
--         REFERENCES nostr_scraping_jobs (activity_id)
--         ON DELETE CASCADE
--         ON UPDATE CASCADE
-- )

-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER set_timestamp_on_nostr_scraping_jobs
-- BEFORE UPDATE ON nostr_scraping_jobs
-- FOR EACH ROW
-- EXECUTE PROCEDURE trigger_set_timestamp();

-- -- --- TODO
-- CREATE TABLE IF NOT EXISTS nostr_scraping_logs (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     activity_id UUID,
--     activity_name VARCHAR,
--     activity_input JSONB,
--     activity_input_hash VARCHAR,
--     activity_output JSONB,
--     activity_output_hash VARCHAR,
--     activity_previous_status VARCHAR,
--     activity_updated_status VARCHAR,
--     log_ingested_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
