CREATE TABLE events(
    id TEXT NOT NULL,
    pubkey TEXT NOT NULL,
    sig TEXT NOT NULL,
    kind INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    tags TEXT
  );
CREATE TABLE tags_index(
    fid INTEGER NOT NULL, 
    value TEXT NOT NULL
  );
CREATE UNIQUE INDEX id_idx ON events(id);
CREATE INDEX pubkey_idx ON events(pubkey);
CREATE INDEX kind_idx ON events(kind);
CREATE INDEX value_idx ON tags_index(value);
CREATE TABLE IF NOT EXISTS 'events_fts_data'(id INTEGER PRIMARY KEY, block BLOB);
CREATE TABLE IF NOT EXISTS 'events_fts_idx'(segid, term, pgno, PRIMARY KEY(segid, term)) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS 'events_fts_docsize'(id INTEGER PRIMARY KEY, sz BLOB, origin INTEGER);
CREATE TABLE IF NOT EXISTS 'events_fts_config'(k PRIMARY KEY, v) WITHOUT ROWID;
CREATE TRIGGER events_ai AFTER INSERT ON events BEGIN
    INSERT INTO events_fts (rowid, text)
      SELECT new.rowid, new.content as text
        WHERE new.kind = 1063 OR new.kind = 32267;
    INSERT INTO events_fts (rowid, text)
      SELECT new.rowid, GROUP_CONCAT(json_extract(value, '$[1]'), ' ') as text
        FROM json_each(new.tags)
        WHERE json_extract(value, '$[0]') IN ('url', 'title', 'description', 'name', 'summary', 'alt', 't', 'd', 'f');
    INSERT INTO tags_index (fid, value)
      SELECT new.rowid, json_extract(value, '$[0]') || ':' || json_extract(value, '$[1]')
        FROM json_each(new.tags)
        WHERE LENGTH(json_extract(value, '$[0]')) = 1;
  END;
CREATE TRIGGER events_ad AFTER DELETE ON events BEGIN
    DELETE FROM events_fts WHERE rowid = old.rowid;
    DELETE FROM tags_index WHERE fid = old.rowid;
  END;
