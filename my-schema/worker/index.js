import { config } from 'dotenv';
import { nostrGet } from './lib/nostrGet.js';
import { verifyEvent } from 'nostr-tools';
import pg from 'pg'

// Start with a Relay
const relays = [
    "wss://primal.net"
]

// Get event Kind 0 Filter
const kind_0_filter = {
    "kinds": [0]
}

// Hook up to Postgres
const { Pool, Client } = pg
config()
if (!process.env.PG_CONN_STRING) {
    throw new Error('PG_CONN_STRING environment variable is not set');
}
const pool = new Pool({
    connectionString: process.env.PG_CONN_STRING,
    ssl: {
        rejectUnauthorized: false,
    },
})
const client = await pool.connect()
let result = await client.query('SELECT NOW() as now')
if ("now" in result.rows[0]) {
    console.log("Sucessfully connected to postgres")
} else {
    console.log("Could not connect to postgres")
    process.exit()
}


async function filter_limit_loop(filter, relay_url, size, optional_timestamp){
    // GET_EVENTS
    filter.limit = size
    if(optional_timestamp != undefined) {
        filter.until = optional_timestamp
    }
    let nostrGet_results
    await client.query(`
        INSERT INTO simple_nostr_scraping_logs
        ( log_title, log_status, filter_json, relay_url ) VALUES
        ( $1, $2, $3, $4)
    `, ["filter_limit_loop", "GET_EVENTS START", filter, relay_url])
    try {
        nostrGet_results = await nostrGet([relay_url], filter)
    } catch (error) {
        await client.query(`
            INSERT INTO simple_nostr_scraping_logs
            ( log_title, log_status, log_description, filter_json, relay_url ) VALUES
            ( $1, $2, $3, $4)
        `, ["filter_limit_loop", "GET_EVENTS ERROR", JSON.stringify(error), filter, relay_url])
        return
    }
    await client.query(`
        INSERT INTO simple_nostr_scraping_logs
        ( log_title, log_status, filter_json, relay_url ) VALUES
        ( $1, $2, $3, $4)
    `, ["filter_limit_loop", "GET_EVENTS SUCCESS", filter, relay_url])

    // Save the Nostr Events to the Database
    await client.query(`
        INSERT INTO simple_nostr_scraping_logs
        ( log_title, log_status, filter_json, relay_url ) VALUES
        ( $1, $2, $3, $4)
    `, ["filter_limit_loop", "INSERTING_EVENTS START", filter, relay_url])
    try {
        await client.query('BEGIN')
        for (const event of nostrGet_results) {
            await client.query(`
                        INSERT INTO nostr_events (
                            event_id,
                            created_at,
                            kind,
                            pubkey,
                            sig,
                            content,
                            raw_event,
                            is_verified
                        ) VALUES (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5,
                            $6,
                            $7,
                            $8
                        ) ON CONFLICT (event_id) DO NOTHING`,
                [
                    event.id,
                    event.created_at,
                    event.kind,
                    event.pubkey,
                    event.sig,
                    event.content,
                    JSON.stringify(event),
                    await verifyEvent(event)
                ]
            )
            await client.query(`
                        INSERT INTO nostr_event_on_relay (
                            event_id,
                            relay_url
                        ) VALUES (
                            $1,
                            $2
                        )`,
                [
                    event.id,
                    relay_url
                ])
            const indexed_tag_regex = /^[A-Za-z]{2}/;
            for (const tag of event.tags){
                if(indexed_tag_regex.test(tag[0])){
                    await client.query(`
                        INSERT INTO nostr_event_tags (
                            event_id,
                            first_tag,
                            tags
                        ) VALUES (
                            $1,
                            $2,
                            $3
                        ) ON CONFLICT (event_id, first_tag, tags) DO NOTHING`,
                [
                    event.id,
                    tag[0],
                    JSON.stringify(tag)
                ])
                } else {
                    await client.query(`
                        INSERT INTO non_standard_nostr_event_tags (
                            event_id,
                            first_tag,
                            tags
                        ) VALUES (
                            $1,
                            $2,
                            $3
                        ) ON CONFLICT (event_id, first_tag, tags) DO NOTHING`,
                [
                    event.id,
                    tag[0],
                    JSON.stringify(tag)
                ])
                }
            }
            await client.query('COMMIT')
        }
    } catch (error) {
        console.log(error)
        await client.query('ROLLBACK')
        await client.query(`
            INSERT INTO simple_nostr_scraping_logs
            ( log_title, log_status, log_description, filter_json, relay_url ) VALUES
            ( $1, $2, $3, $4, $5)
        `, ["filter_limit_loop", "GET_EVENTS ERROR", JSON.stringify(error), filter, relay_url])
    }
    await client.query(`
        INSERT INTO simple_nostr_scraping_logs
        ( log_title, log_status, filter_json, relay_url ) VALUES
        ( $1, $2, $3, $4)
    `, ["filter_limit_loop", "INSERTING_EVENTS SUCCESS", filter, relay_url])

    // Recursion when Nessesary
    // console.log(nostrGet_results)
    if(nostrGet_results.length == size){
        // Get the smallest timestamp
        //console.log(nostrGet_results[0])
        console.log(optional_timestamp)
        if(optional_timestamp == undefined){
            filter.until = Math.min(...nostrGet_results.map(obj => obj.created_at))
            optional_timestamp = filter.until
        } else {
            filter.until = optional_timestamp - 1
            optional_timestamp = optional_timestamp - 1
        }
        console.log(filter)
        filter_limit_loop(filter, relay_url, size, optional_timestamp)
    } else {
        console.log("filter_limit_loop completed")
        process.exit()
    }
}

// filter_limit_loop(kind_0_filter, "wss://relay.mememaps.net", 1000)
// filter_limit_loop({"kinds": [1]}, "wss://relay.mememaps.net", 100)
filter_limit_loop({"kinds": [1]}, "wss://relay.damus.io/", 500)
