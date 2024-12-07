CREATE TABLE event (
       id text NOT NULL,
       pubkey text NOT NULL,
       created_at integer NOT NULL,
       kind integer NOT NULL,
       tags jsonb NOT NULL,
       content text NOT NULL,
       sig text NOT NULL);
CREATE UNIQUE INDEX ididx ON event(id);
CREATE INDEX pubkeyprefix ON event(pubkey);
CREATE INDEX timeidx ON event(created_at DESC);
CREATE INDEX kindidx ON event(kind);
CREATE INDEX kindtimeidx ON event(kind,created_at DESC);
