SELECT DISTINCT data->>'pubkey'
FROM nostr_events
WHERE data ? 'pubkey';

select distinct pubkey from normalized_nostr_events_t;

select count(distinct pubkey) from normalized_nostr_events_t;


SELECT * FROM normalized_nostr_events_t
WHERE (
    id in ids,
    
);