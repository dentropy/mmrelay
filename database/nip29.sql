--- New ACL List
CREATE TABLE IF NOT EXISTS nip29_groups_t (
    group_id VARCHAR UNIQUE
);

CREATE TABLE IF NOT EXISTS nip29_acl_t (
    pubkey VARCHAR,
    group_id VARCHAR,
    CONSTRAINT fk_nip29_groups_t_to_nip29_groups_act_t
        FOREIGN KEY (group_id)
        REFERENCES nip29_groups_t (group_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nip29_normalized_nostr_events_t (
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

CREATE TABLE IF NOT EXISTS nip29_nostr_event_tags_t (
    id VARCHAR,
    tag_json_index INTEGER,
    first_tag VARCHAR,
    second_tag VARCHAR,
    third_tag VARCHAR,
    fourth_tag VARCHAR,
    tags TEXT,
    CONSTRAINT fk_nip29_nostr_event_relay_metadata
        FOREIGN KEY (id)
        REFERENCES normalized_nip29_nostr_events_t (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nip29_non_standard_nostr_event_tags_t (
    id VARCHAR,
    tag_json_index INTEGER,
    first_tag VARCHAR,
    second_tag VARCHAR,
    third_tag VARCHAR,
    fourth_tag VARCHAR,
    tags JSONB,
    CONSTRAINT fk_nip29_non_standard_nostr_event_tags
        FOREIGN KEY (id)
        REFERENCES nip29_normalized_nostr_events_t (id)
        ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION nip29_insert_nostr_event_tags()
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
            INSERT INTO nip29_nostr_event_tags_t (
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
            INSERT INTO nip29_non_standard_nostr_event_tags_t (
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

CREATE TRIGGER nip29_run_insert_nostr_event_tags_on_normalized_nostr_events
AFTER INSERT ON nip29_normalized_nostr_events_t
FOR EACH ROW
EXECUTE PROCEDURE nip29_insert_nostr_event_tags();

--- Searching Stuff

CREATE TABLE nip29_nostr_event_content_indexed (
    id VARCHAR not NULL,
    title VARCHAR,
    content TEXT,
    summary TEXT,
    CONSTRAINT fk_nip29_non_standard_nostr_event_tags
        FOREIGN KEY (id)
        REFERENCES nip29_normalized_nostr_events_t (id)
        ON DELETE CASCADE
);
ALTER TABLE nip29_nostr_event_content_indexed
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, ''))) STORED;
CREATE INDEX nip29_nostr_event_content_index ON nip29_nostr_event_content_indexed USING gin(search_vector);