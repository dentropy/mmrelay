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

--- Existing Schema
CREATE TABLE IF NOT EXISTS nip29_normalized_nostr_events_t (
    group_id VARCHAR,
    id VARCHAR NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    kind integer NOT NULL,
    pubkey VARCHAR NOT NULL,
    sig VARCHAR,
    content VARCHAR,
    tags TEXT,
    num_tags INTEGER,
    raw_event VARCHAR,
    is_verified BOOLEAN,
    CONSTRAINT fk_nip29_groups_t_to_nip29_normalized_nostr_events_t
        FOREIGN KEY (group_id)
        REFERENCES nip29_groups_t (group_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nip29_nostr_event_tags_t (
    id VARCHAR,
    first_tag VARCHAR,
    group_id VARCHAR,
    tags TEXT,
    CONSTRAINT fk_nip29_nostr_event_relay_metadata
        FOREIGN KEY (id)
        REFERENCES nip29_normalized_nostr_events_t (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_nip29_standard_nostr_event_group_id
        FOREIGN KEY (group_id)
        REFERENCES nip29_groups_t (group_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS non_standard_nostr_event_tags_t (
    id VARCHAR,
    first_tag VARCHAR,
    group_id VARCHAR,
    tags JSONB,
    CONSTRAINT fk_nip29_non_standard_nostr_event_tags
        FOREIGN KEY (id)
        REFERENCES nip29_normalized_nostr_events_t (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_nip29_non_standard_nostr_event_group_id
        FOREIGN KEY (group_id)
        REFERENCES nip29_groups_t (group_id)
        ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION nip29_insert_nostr_event_tags()
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
            INSERT INTO nip29_nostr_event_tags_t (
                id,
                group_id,
                first_tag,
                tags
            ) VALUES (
                NEW.id,
                NEW.group_id,
                first_tag_extracted,  -- Insert the tag directly
                item::jsonb
            );
        ELSE
            -- Insert into non_standard_nostr_event_tags
            INSERT INTO nip29_non_standard_nostr_event_tags_t (
                id,
                group_id,
                first_tag,
                tags
            ) VALUES (
                NEW.id,
                NEW.group_id,
                first_tag_extracted,  -- Insert the tag directly
                item
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER run_insert_nostr_event_tags_on_nip29_normalized_nostr_events
AFTER INSERT ON nip29_normalized_nostr_events_t
FOR EACH ROW
EXECUTE PROCEDURE nip29_insert_nostr_event_tags();
