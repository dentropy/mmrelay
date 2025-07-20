select * from normalized_nostr_events_t;
select count(*) from normalized_nostr_events_t;
select count(distinct(pubkey)) from normalized_nostr_events_t ;
SELECT pubkey, COUNT(*) AS pubkey_note_count
FROM normalized_nostr_events_t
GROUP BY pubkey
order by pubkey_note_count desc
limit 100;

select * from nostr_event_on_relay_t;
select count(*) from nostr_event_on_relay_t;

select * from scraping_nostr_filters_t;

select * from nostr_filter_scraping_logs_t;
select count(*) from nostr_filter_scraping_logs_t;
