import { config } from 'dotenv';
import pg from 'pg'
import Ajv from "ajv";
import { scrape_nip05_0_0_1 } from "./activities/scrape.nip05.0.0.1.js"

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

// Load all Acttivies, also validating their JSONSchemas
const ACTIVITY_scrape_nip05_0_0_1 = new scrape_nip05_0_0_1()
let ACTIVITIES_LIST = [
    ACTIVITY_scrape_nip05_0_0_1
]
let ACTIVITY_NAMES = []
for (const activity of ACTIVITIES_LIST) {
    ACTIVITY_NAMES.push(activity.activity_name)
}
console.log(`ACTIVITY_NAMES \n${JSON.stringify(ACTIVITY_NAMES, null, 2)}`)
// Generate the query for querrying the database

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
            if (activity.activity_name == job_result.rows[0].activity_name) {
                // JSON Schema Validation
                if (activity.validate(job_result.rows[0].activity_input)) {
                    // Run Activity
                    let activity_result = await activity.run(job_result.rows[0].activity_input)
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