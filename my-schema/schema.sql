create table nostr_events (
    event_id VARCHAR NOT NULL UNIQUE,
    created_at INTEGER NOT NULL UNIQUE,
    kind integer NOT NULL UNIQUE,
    content VARCHAR,
    content_sha256 VARCHAR,
    pubkey VARCHAR,
    sig VARCHAR,
    raw_event NOT NULL UNIQUE
);

create table nostr_event_tags (
    event_id VARCHAR,
    first_tag VARCHAR,
    tags JSONB,
    CONSTRAINT fk_nostr_event_tags
        FOREIGN KEY (event_id)
        REFERENCES nostr_events (event_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

create table all_nostr_event_tags (
    event_id VARCHAR,
    first_tag VARCHAR,
    tags JSONB,
    CONSTRAINT fk_all_nostr_event_tags
        FOREIGN KEY (event_id)
        REFERENCES nostr_events (event_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
