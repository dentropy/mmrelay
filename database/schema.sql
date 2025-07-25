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

CREATE INDEX pubkey_normalized_nostr_events_t ON normalized_nostr_events_t (pubkey);

CREATE TABLE IF NOT EXISTS nostr_event_tags_t (
    id VARCHAR,
    tag_json_index INTEGER,
    first_tag VARCHAR,
    second_tag VARCHAR,
    third_tag VARCHAR,
    fourth_tag VARCHAR,
    tags TEXT,
    CONSTRAINT fk_nostr_event_relay_metadata
        FOREIGN KEY (id)
        REFERENCES normalized_nostr_events_t (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS non_standard_nostr_event_tags_t (
    id VARCHAR,
    tag_json_index INTEGER,
    first_tag VARCHAR,
    second_tag VARCHAR,
    third_tag VARCHAR,
    fourth_tag VARCHAR,
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
    second_tag_extracted VARCHAR;
    third_tag_extracted VARCHAR;
    fourth_tag_extracted VARCHAR;
    count_tag_json_index INTEGER;
BEGIN
    -- Loop through the JSONB array 'tags' from the NEW record
    count_tag_json_index := 0;
    FOR item IN
        SELECT jsonb_array_elements(NEW.raw_event::jsonb->'tags') AS tag
    LOOP
        -- Check if the tag matches the pattern
        first_tag_extracted := item::jsonb->>0;
        second_tag_extracted := item::jsonb->>1;
        third_tag_extracted := item::jsonb->>2;
        fourth_tag_extracted := item::jsonb->>3;
        IF first_tag_extracted ~ '^[A-Za-z]{1,2}$' THEN
            -- Insert into nostr_event_tags
            INSERT INTO nostr_event_tags_t (
                id,
                first_tag,
                second_tag,
                third_tag,
                fourth_tag,
                tags,
                tag_json_index
            ) VALUES (
                NEW.id,
                first_tag_extracted,  -- Insert the tag directly
                second_tag_extracted,
                third_tag_extracted,
                fourth_tag_extracted,
                item::jsonb,
                count_tag_json_index
            );
        ELSE
            -- Insert into non_standard_nostr_event_tags
            INSERT INTO non_standard_nostr_event_tags_t (
                id,
                first_tag,
                second_tag,
                third_tag,
                fourth_tag,
                tags,
                tag_json_index
            ) VALUES (
                NEW.id,
                first_tag_extracted,  -- Insert the tag directly
                second_tag_extracted,
                third_tag_extracted,
                fourth_tag_extracted,
                item,
                count_tag_json_index
            );
        count_tag_json_index := count_tag_json_index + 1;
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

CREATE TABLE IF NOT EXISTS nostr_event_content_indexed (
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


CREATE TABLE if not exists nostr_relay_metadata_t (
    id SERIAL PRIMARY KEY,
    relay_url VARCHAR,
    http_url VARCHAR,
    success BOOLEAN,
    relay_metadata JSONB,
    error_text VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);