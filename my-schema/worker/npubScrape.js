import { config } from 'dotenv';
import pg from 'pg'
import Ajv from "ajv";
import { scrape_pubkey_from_specific_relay } from "./activities/scrape_pubkey_from_specific_relay.js"
import { validateEvent, verifyEvent } from 'nostr-tools';
// Connection to Postgres Database
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

const ACTIVITY_scrape_pubkey_from_specific_relay = new scrape_pubkey_from_specific_relay()
let ACTIVITIES_LIST = [
    ACTIVITY_scrape_pubkey_from_specific_relay
]
let ACTIVITY_NAMES = []
for (const activity of ACTIVITIES_LIST) {
    ACTIVITY_NAMES.push(activity.activity_name)
}
console.log(`ACTIVITY_NAMES \n${JSON.stringify(ACTIVITY_NAMES, null, 2)}`)


let input_string = ""
for (let i = 1; i <= ACTIVITY_NAMES.length; i++) {
    input_string += `$${i},`
}
input_string = input_string.substring(0, input_string.length - 1)
const activity_query = `
UPDATE nostr_scraping_jobs
SET 
    activity_status = 'Running',
    worker_id = 'worker001'
WHERE activity_id = (
    SELECT activity_id
    FROM nostr_scraping_jobs
    WHERE 
        activity_status = 'TODO'
        and activity_name in (
            ${input_string}
        )
    ORDER BY created_at DESC
    LIMIT 1
)
RETURNING *;`
console.log(activity_query)


// Loop where we query the database for jobs todo
async function check_jobs() {
    console.log("Checking for a new Job")
    let job_result = await client.query(activity_query, ACTIVITY_NAMES)
    // Check if we actually get a result back
    console.log(job_result.rows)
    if (job_result.rows.length == 0) {
        console.log("No jobs in queue, checking again in a bit")
    } else {
        for (const activity of ACTIVITIES_LIST) {
            let activity_result
            if (activity.activity_name == job_result.rows[0].activity_name) {
                // JSON Schema Validation
                if (activity.validate(job_result.rows[0].activity_input)) {
                    // Run Activity
                    activity_result = await activity.run(job_result.rows[0].activity_input)
                    console.log("activity_result")
                    console.log(activity_result)
                } else {
                    // Report back with Error
                    const json_schema_failed_query = `
                    UPDATE nostr_scraping_jobs
                    SET
                        activity_status = 'ERROR'
                    WHERE activity_id = ($1)
                    RETURNING *;
                    `
                    let failed_json_schema_query = await client.query(json_schema_failed_query, [job_result.rows[0].activity_id])
                    console.log(`activity_id: ${job_result.rows[0].activity_id} failed due to invalid JSONSchema`)
                }
                try {
                    // Log events to database
                    await client.query('BEGIN')
                    for (const event of activity_result) {
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
                                job_result.rows[0].activity_input.relays[0]
                            ])
                        // Log and update the job
                        await client.query(`
                INSERT INTO nostr_scraping_logs (
                    activity_id,
                    activity_name,
                    activity_input,
                    activity_output,
                    activity_previous_status,
                    activity_updated_status
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                );
                `, [
                            job_result.rows[0].activity_id,
                            job_result.rows[0].activity_name,
                            job_result.rows[0].activity_input,
                            JSON.stringify(activity_result),
                            job_result.rows[0].activity_status,
                            "compelted",
                        ])
                        await client.query(`
                    UPDATE nostr_scraping_jobs
                    SET
                        activity_status = 'COMPLETED'
                    WHERE activity_id = ($1)
                    RETURNING *;
                    `, [job_result.rows[0].activity_id])
                        await client.query('COMMIT')
                    }
                } catch (error) {
                    console.log(error)
                    await client.query('ROLLBACK')
                    await client.query(`
                    UPDATE nostr_scraping_jobs
                    SET
                        activity_status = 'ERROR'
                    WHERE activity_id = ($1)
                    RETURNING *;
                    `, [job_result.rows[0].activity_id])
                    await client.query(`
                        INSERT INTO nostr_scraping_logs (
                            activity_id,
                            activity_name,
                            activity_input,
                            activity_output,
                            activity_previous_status,
                            activity_updated_status
                        ) VALUES (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5,
                            $6
                        );
                        `, [
                        job_result.rows[0].activity_id,
                        job_result.rows[0].activity_name,
                        job_result.rows[0].activity_input,
                        JSON.stringify({
                            "error": "",
                            "error_description": "Error inserting nostr event data into db",
                            "raw_error": JSON.stringify(error)
                        }),
                        job_result.rows[0].activity_status,
                        "compelted",
                    ])
                }
                // Log the relay the events were retrieved from in database
                // Scape more events if the number of returned events is the same as the limit input
            }
        }
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
    check_jobs()
}
await check_jobs()

// Close up everything and exit
async function shutdown() {
    await client.release()
    await pool.end()
    console.log("\n\nClosed postgres connection")
}