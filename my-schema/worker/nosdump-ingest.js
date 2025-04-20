import fs from 'node:fs'
import readline from 'node:readline'
import { verifyEvent } from 'nostr-tools';
import path from 'path';
// Read all the nostr events from a nosdump file

// Hook up to Postgres
import { config } from 'dotenv';
import pg from 'pg'
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


let jsonnl_filename = "./ScrapedData/bagaaierabnjlhwalrbidwukf7mb5fcecjpyii6t2o76cmgt6vnjbdfjwmjja.jsonl"

// Count the number of lines
async function count_line_num(file_name) {
    return new Promise((resolve, reject) => {
        let count = 0;

        const stream = fs.createReadStream(file_name);

        stream.on('data', (chunk) => {
            for (let i = 0; i < chunk.length; ++i) {
                if (chunk[i] === 10) count++; // 10 is newline '\n'
            }
        });

        stream.on('end', () => {
            resolve(count);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

// const line_count_test = await count_line_num("./index.js")
// console.log(line_count_test)


// https://stackoverflow.com/questions/16010915/parsing-huge-logfiles-in-node-js-read-in-line-by-line
async function load_lines(file_name, line_start, line_end) {
    return new Promise((resolve, reject) => {
        const instream = fs.createReadStream(file_name);
        let count = 0;
        let lines = [];

        const rl = readline.createInterface({
            input: instream,
            crlfDelay: Infinity,
            terminal: false
        });

        rl.on('line', (line) => {
            if (count > line_start && count < line_end) {
                lines.push(line)
                // console.log(line);
            }
            count += 1;
        });

        rl.on('close', () => {
            resolve(lines);
        });

        rl.on('error', (err) => {
            reject(err);
        });
    });
}

// const load_liens_test = await load_lines("./index.js", 20, 30)
// console.log("response")
// console.log(load_liens_test)

// Load metadata
let parts = jsonnl_filename.split(path.sep);
parts[parts.length - 1] = "metadata-" + parts[parts.length - 1]
const metadata_filepath = parts.join("/").slice(0, -1)
console.log(metadata_filepath)
let metadata = JSON.parse(fs.readFileSync(metadata_filepath));
console.log(metadata)
const relay_url = metadata.relay
const filter = metadata.filter


const line_count = await count_line_num(jsonnl_filename)
console.log(line_count)
for (let count = 0; count < line_count; count += 10000) {
    const loaded_lines = await load_lines(jsonnl_filename, count, count + 10000)
    let parsed_json = []
    for (const line of loaded_lines) {
        try {
            parsed_json.push(JSON.parse(line))
        } catch (error) {
            console.log("Error parsing JSON in JSONNL File")
            console.log(error)
        }
    }
    await client.query('BEGIN')
    for (const event of parsed_json) {
        console.log("IN_LOOP")
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
        for (const tag of event.tags) {
            if (indexed_tag_regex.test(tag[0])) {
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
    }
    await client.query(`
                    INSERT INTO simple_nostr_scraping_logs
                    ( log_title, log_status, log_description, filter_json, relay_url, log_data ) VALUES
                    ( $1, $2, $3, $4, $5, $6)
                `, ["filter_limit_loop", "SUCCESS", "INSERTING_EVENTS", filter, relay_url, parsed_json])
    await client.query('COMMIT')
    console.log("Done Ingesting Some Data")
}


// Loop through the lines counted

// Load the events into postgres