CREATE TABLE event (
id INTEGER PRIMARY KEY,
event_hash BLOB NOT NULL, -- 32-byte SHA256 hash
first_seen INTEGER NOT NULL, -- when the event was first seen (not authored!) (seconds since 1970)
created_at INTEGER NOT NULL, -- when the event was authored
expires_at INTEGER, -- when the event expires and may be deleted
author BLOB NOT NULL, -- author pubkey
delegated_by BLOB, -- delegator pubkey (NIP-26)
kind INTEGER NOT NULL, -- event kind
hidden INTEGER, -- relevant for queries
content TEXT NOT NULL -- serialized json of event object
);
CREATE UNIQUE INDEX event_hash_index ON event(event_hash);
CREATE INDEX author_index ON event(author);
CREATE INDEX kind_index ON event(kind);
CREATE INDEX created_at_index ON event(created_at);
CREATE INDEX delegated_by_index ON event(delegated_by);
CREATE INDEX event_composite_index ON event(kind,created_at);
CREATE INDEX kind_author_index ON event(kind,author);
CREATE INDEX kind_created_at_index ON event(kind,created_at);
CREATE INDEX author_created_at_index ON event(author,created_at);
CREATE INDEX author_kind_index ON event(author,kind);
CREATE INDEX event_expiration ON event(expires_at);
CREATE TABLE tag (
id INTEGER PRIMARY KEY,
event_id INTEGER NOT NULL, -- an event ID that contains a tag.
name TEXT, -- the tag name ("p", "e", whatever)
value TEXT, -- the tag value, if not hex.
value_hex BLOB, -- the tag value, if it can be interpreted as a lowercase hex string.
created_at INTEGER NOT NULL, -- when the event was authored
kind INTEGER NOT NULL, -- event kind
FOREIGN KEY(event_id) REFERENCES event(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX tag_val_index ON tag(value);
CREATE INDEX tag_composite_index ON tag(event_id,name,value);
CREATE INDEX tag_name_eid_index ON tag(name,event_id,value);
CREATE INDEX tag_covering_index ON tag(name,kind,value,created_at,event_id);
CREATE TABLE user_verification (
id INTEGER PRIMARY KEY,
metadata_event INTEGER NOT NULL, -- the metadata event used for this validation.
name TEXT NOT NULL, -- the nip05 field value (user@domain).
verified_at INTEGER, -- timestamp this author/nip05 was most recently verified.
failed_at INTEGER, -- timestamp a verification attempt failed (host down).
failure_count INTEGER DEFAULT 0, -- number of consecutive failures.
FOREIGN KEY(metadata_event) REFERENCES event(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX user_verification_name_index ON user_verification(name);
CREATE INDEX user_verification_event_index ON user_verification(metadata_event);
CREATE TABLE account (
pubkey TEXT PRIMARY KEY,
is_admitted INTEGER NOT NULL DEFAULT 0,
balance INTEGER NOT NULL DEFAULT 0,
tos_accepted_at INTEGER
);
CREATE INDEX user_pubkey_index ON account(pubkey);
CREATE TABLE invoice (
payment_hash TEXT PRIMARY KEY,
pubkey TEXT NOT NULL,
invoice TEXT NOT NULL,
amount INTEGER NOT NULL,
status TEXT CHECK ( status IN ('Paid', 'Unpaid', 'Expired' ) ) NOT NUll DEFAULT 'Unpaid',
description TEXT,
created_at INTEGER NOT NULL,
confirmed_at INTEGER,
CONSTRAINT invoice_pubkey_fkey FOREIGN KEY (pubkey) REFERENCES account (pubkey) ON DELETE CASCADE
);
CREATE INDEX invoice_pubkey_index ON invoice(pubkey);
