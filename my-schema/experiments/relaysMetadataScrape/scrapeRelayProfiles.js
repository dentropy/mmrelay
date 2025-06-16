import postgres from 'postgres'

const sql = await postgres(
    process.env.PG_CONN_STRING, {
    ssl: { rejectUnauthorized: false }
})

let relay_list = await sql`
select
	relay_url
from
	nostr_relay_metadata_t
where
	success = true
	-- AND relay_url not in (select relay_url from nostr_filter_scraping_logs_t);
`

for (const relay of relay_list){
    console.log(relay.relay_url)
    let unix_time = String(Date.now() / 1000 | 0)
    console.log(unix_time)
    await sql`
        INSERT INTO scraping_nostr_filters_t (
            scraping_status,
            filter_json,
            metadata,
            num_results,
            relay_url,
            since,
            incrementer,
            until
        ) VALUES (
            'TODO',                              -- scraping_status
            '{"kinds":[0, 10002]}',                     -- filter_json
            '{}',                                -- metadata
            0,                                   -- num_results
            ${ relay.relay_url },               -- relay_url
            0,                                   -- since
            3600,                                -- incrementer of an hour
            ${ unix_time }                        -- until
        );    
    `
    console.log(`Inserted ${relay.relay_url}`)
}

process.exit()