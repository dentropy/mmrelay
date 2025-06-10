import postgres from 'postgres'

const sql = await postgres(
    process.env.PG_CONN_STRING, {
    ssl: { rejectUnauthorized: false }
})

let relay_list = await sql`
select * from nostr_relay_metadata_t where success = true;
`

for (const relay of relay_list){
    console.log(`
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
            '{"kinds":[0]}',                     -- filter_json
            '{}',                                -- metadata
            0,                                   -- num_results
            '${relay}',                          -- relay_url
            1745107200,                          -- since
            3600,                                -- incrementer of an hour
            ${Date.now()}                        -- until
        );    
    `)
}