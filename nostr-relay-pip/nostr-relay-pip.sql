CREATE TABLE alembic_version (
	version_num VARCHAR(32) NOT NULL, 
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);
CREATE TABLE auth (
	pubkey TEXT NOT NULL, 
	roles TEXT, 
	created DATETIME, 
	PRIMARY KEY (pubkey)
);
CREATE TABLE events (
	id BLOB NOT NULL, 
	created_at INTEGER, 
	kind INTEGER, 
	pubkey BLOB, 
	tags JSON, 
	sig BLOB, 
	content TEXT, 
	PRIMARY KEY (id)
);
CREATE INDEX createdidx ON events (created_at);
CREATE INDEX kindidx ON events (kind);
CREATE INDEX pubkeyidx ON events (pubkey);
CREATE TABLE identity (
	identifier TEXT NOT NULL, 
	pubkey TEXT, 
	relays JSON, 
	PRIMARY KEY (identifier)
);
CREATE TABLE tags (
	id BLOB, 
	name TEXT, 
	value TEXT, 
	FOREIGN KEY(id) REFERENCES events (id) ON DELETE CASCADE, 
	CONSTRAINT unique_tag UNIQUE (id, name, value)
);
CREATE INDEX tagidx ON tags (name, value);
CREATE TABLE verification (
	id INTEGER NOT NULL, 
	identifier TEXT, 
	metadata_id BLOB, 
	verified_at TIMESTAMP, 
	failed_at TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(metadata_id) REFERENCES events (id) ON DELETE CASCADE
);
CREATE INDEX identifieridx ON verification (identifier);
CREATE INDEX metadataidx ON verification (metadata_id);
CREATE INDEX verifiedidx ON verification (verified_at);
CREATE INDEX kindcreatedpubkeyidx ON events (created_at, kind, pubkey);
