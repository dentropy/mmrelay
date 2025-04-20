import { config } from 'dotenv';
import { nostrGet } from './lib/nostrGet.js';
import { verifyEvent } from 'nostr-tools';
import pg from 'pg'

// Start with a Relay
// https://raw.githubusercontent.com/bordalix/nostr-broadcast/refs/heads/master/js/relays.js

const relays = [
    'wss://relay.damus.io',
    'wss://atlas.nostr.land', // paid relay	15000	npub12262qa4uhw7u8gdwlgmntqtv7aye8vdcmvszkqwgs0zchel6mz7s6cgrkj
    'wss://bitcoiner.social', // paid relay	1000	npub1dxs2pygtfxsah77yuncsmu3ttqr274qr5g5zva3c7t5s3jtgy2xszsn4st
    'wss://brb.io',
    'wss://eden.nostr.land', // paid relay	5000	npub16k7j4mwsqm8hakjl8x5ycrqmhx89lxkfwz2xxxcw75eav7sd8ztqy2rwdn
    'wss://expensive-relay.fiatjaf.com',
    'wss://freedom-relay.herokuapp.com',
    'wss://nos.lol',
    'wss://nostr-2.zebedee.cloud',
    'wss://nostr-pub.wellorder.net',
    'wss://nostr-relay.alekberg.net',
    'wss://nostr-relay.freeberty.net',
    'wss://nostr-relay.wlvs.space',
    'wss://nostr.bitcoiner.social',
    'wss://nostr.blocs.fr',
    'wss://nostr.coollamer.com',
    'wss://nostr.decentony.com', // paid relay	7000	npub1pp9csm9564ewzer3f63284mrd9u2zssmreq42x4rtt390zmkrj2st4fzpm
    'wss://nostr.fmt.wiz.biz',
    'wss://nostr.gives.africa', // paid relay	10000	npub1g8dcep2exsadx9smhdrgwds06pgfc9yyyww6ftdcgnyukcuzk2csqs5jed
    'wss://nostr.inosta.cc', // paid relay	5000	npub1r34nhc6nqswancymk452f2frgn3ypvu77h4njr67n6ppyuls4ehs44gv0h
    'wss://nostr.milou.lol', // paid relay	1000	npub1rvg76s0gz535txd9ypg2dfqv0x7a80ar6e096j3v343xdxyrt4ksmkxrck
    'wss://nostr.onsats.org',
    'wss://nostr.orangepill.dev',
    'wss://nostr.plebchain.org', // paid relay	6969	npub1u2tehhr3ye4lv4dc8aen2gkxf6zljdpf356sgfjqfun0wxehvquqgvhuec
    'wss://nostr.rocks',
    'wss://nostr.sandwich.farm',
    'wss://nostr.wine', // paid relay	8888	npub18kzz4lkdtc5n729kvfunxuz287uvu9f64ywhjz43ra482t2y5sks0mx5sz
    'wss://nostr.zebedee.cloud',
    'wss://private.red.gb.net', // paid relay	8888	npub1nctdevxxuvth3sx6r0gutv4tmvhwy9syvpkr3gfd5atz67fl97kqyjkuxk
    'wss://puravida.nostr.land', // paid relay	10000	npub16k7j4mwsqm8hakjl8x5ycrqmhx89lxkfwz2xxxcw75eav7sd8ztqy2rwdn
    'wss://relay.current.fyi',
    'wss://relay.nostr.bg',
    'wss://relay.nostr.com.au', // paid relay	6969	npub1qqqqqrre3jxkuyj3s4m59usdyvm0umgm0lpy6cqjtwpt649sdews5q3hw7
    'wss://relay.nostr.info',
    'wss://relay.nostrati.com', // paid relay	2000	npub1qqqqqqqut3z3jeuxu70c85slaqq4f87unr3vymukmnhsdzjahntsfmctgs
    'wss://relay.nostrich.land', // paid relay	2100	npub1vj0wlergmkcs0sz7hfks2ywj555c2s87f40squ4sqcmqpr7897fqn6mfew
    'wss://relay.nostriches.org', // paid relay 421	npub1vnmhd287pvxxk5w9mcycf23av24nscwk0da7rrfaa5wq4l8hsehs90ftlv
    'wss://relay.orangepill.dev', // paid relay	4500	npub16jzr7npgp2a684pasnkhjf9j2e7hc9n0teefskulqmf42cqmt4uqwszk52
    'wss://relay.snort.social',
    'wss://relayer.fiatjaf.com',
    'wss://rsslay.fiatjaf.com',
    'wss://primal.net'
  ]

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


async function filter_limit_loop(filter, relay_url, size, optional_timestamp, is_origional_loop){
    if(is_origional_loop == undefined) {
        await client.query(`
            INSERT INTO simple_nostr_scraping_logs
            ( log_title, log_status, filter_json, relay_url ) VALUES
            ( $1, $2, $3, $4)
        `, ["filter_limit_loop", "FILTER START", filter, relay_url])
    }
    // GET_EVENTS
    filter.limit = size
    if(optional_timestamp != undefined && filter.until != undefined) {
        filter.until = optional_timestamp
    }
    console.log("Inital Filter")
    console.log(filter)
    let nostrGet_results
    await client.query(`
        INSERT INTO simple_nostr_scraping_logs
        ( log_title, log_status, log_description, filter_json, relay_url ) VALUES
        ( $1, $2, $3, $4, $5)
    `, ["filter_limit_loop", "START", "GET_EVENTS", filter, relay_url])
    try {
        nostrGet_results = await nostrGet([relay_url], filter)
    } catch (error) {
        await client.query(`
            INSERT INTO simple_nostr_scraping_logs
            ( log_title, log_status, log_description, filter_json, relay_url ) VALUES
            ( $1, $2, $3, $4, $5)
        `, ["filter_limit_loop", "ERROR", "GET_EVENTS", JSON.stringify(error), filter, relay_url])
        return
    }
    await client.query(`
        INSERT INTO simple_nostr_scraping_logs
        ( log_title, log_status, log_description, filter_json, relay_url ) VALUES
        ( $1, $2, $3, $4, $5)
    `, ["filter_limit_loop", "SUCCESS", "GET_EVENTS", filter, relay_url])

    // Save the Nostr Events to the Database
    await client.query(`
        INSERT INTO simple_nostr_scraping_logs
        ( log_title, log_status, log_description, filter_json, relay_url ) VALUES
        ( $1, $2, $3, $4, $5)
    `, ["filter_limit_loop", "START", "INSERTING_EVENTS", filter, relay_url])
    try {
        if (nostrGet_results.length == 0) {
            await client.query(`
                INSERT INTO simple_nostr_scraping_logs
                ( log_title, log_status, filter_json, relay_url, log_description ) VALUES
                ( $1, $2, $3, $4, $5)
            `, ["filter_limit_loop", "INSERTING_EVENTS SUCCESS", filter, relay_url, "Got Zero Results"])
        } else {
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
                await client.query(`
                    INSERT INTO simple_nostr_scraping_logs
                    ( log_title, log_status, log_description, filter_json, relay_url, log_data ) VALUES
                    ( $1, $2, $3, $4, $5, $6)
                `, ["filter_limit_loop", "SUCCESS", "INSERTING_EVENTS", filter, relay_url, nostrGet_results])
        }
        }
    } catch (error) {
        console.log(error)
        await client.query('ROLLBACK')
        await client.query(`
            INSERT INTO simple_nostr_scraping_logs
            ( log_title, log_status, log_description, log_data, filter_json, relay_url ) VALUES
            ( $1, $2, $3, $4, $5, $6)
        `, ["filter_limit_loop", "ERROR", "GET_EVENTS", JSON.stringify(error), filter, relay_url])
    }
    if(nostrGet_results.length == size){
        filter.until = Math.min(...nostrGet_results.map(obj => obj.created_at))
        optional_timestamp = filter.until
        console.log("Next Filter")
        console.log(filter)
        filter_limit_loop(filter, relay_url, size, optional_timestamp, true)
    } else {
        console.log("filter_limit_loop completed")
        await client.query(`
            INSERT INTO simple_nostr_scraping_logs
            ( log_title, log_status, log_description, filter_json, relay_url ) VALUES
            ( $1, $2, $3, $4, $5)
        `, ["filter_limit_loop", "COMPLETED", "FILTER", filter, relay_url])
    }
}

// filter_limit_loop({"kinds": [0]}, "wss://relay.mememaps.net", 100)
// filter_limit_loop({"kinds": [1]}, "wss://relay.mememaps.net", 100)
filter_limit_loop({"kinds": [0], "until": 1744971551 }, "wss://relay.damus.io/", 100)
// filter_limit_loop({"kinds": [0]}, "wss://relay.damus.io/", 100)

for (const relay of relays){
    console.log(relay)
    await filter_limit_loop({"kinds": [0] }, relay, 100)
}