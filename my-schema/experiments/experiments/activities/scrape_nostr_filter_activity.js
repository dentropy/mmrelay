// THIS DOES REACT out into the Internet to scrape data

import { Job } from './master.job.js';
import Ajv from "ajv";
export class scrape_nostr_filter_activity extends Job {
    constructor() {
        const activity_name = "scrape_nostr_filter_activity"
        const jsonSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "properties": {
                "filter": {
                    "type": "object",
                    "until": {
                        "type": "number"
                    },
                    "since": {
                        "type": "number"
                    },
                    "authors": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "kinds": {
                        "type": "array",
                        "items": {
                            "type": "number"
                        }
                    },
                    "limit": {
                        "type": "number"
                    }
                },
                "relays": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
            },
            "additionalProperties": false,
            "required": [
                "filter",
                "relays"
            ]
        }
        super(activity_name, jsonSchema);
        const ajv = new Ajv({ allErrors: true });
        this.validate = ajv.compile(this.jsonSchema);
    }

    async run(job_input){
        try {
            await nostrGet(job_input.relays, job_input.filter)   
        } catch (error) {
            return {
                "error": "",
                "job_name": this.activity_name,
                "error_description": "Could not resolve nostr filter",
                "raw_error": JSON.stringify(error)
            }
        }
    }

    async data_ingestion() {
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

    async activity_loop(client, job_input, job_result) {
        // Tell Postgres I am all done
    }
}