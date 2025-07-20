// This does not reach out into the Internet to scrape data
// Spawn the activities that pagiate through a filter
// This tracks when the pagiation is done

import { Job } from './master.job.js';
import Ajv from "ajv";
export class scrape_nostr_filter_pagiated_workflow extends Job {
    constructor() {
        const activity_name = "scrape_nostr_filter_pagiated_workflow"
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
                "max_recursion": {
                    "type": "number"
                }
            },
            "additionalProperties": false,
            "required": [
                "filter",
                "relays",
                "max_recursion"
            ]
        }
        super(activity_name, jsonSchema);
        const ajv = new Ajv({ allErrors: true });
        this.validate = ajv.compile(this.jsonSchema);
    }

    async run(job_input) {
        // for (const relay of job_input.relays) {
        //     if (!(relay.includes("ws://") || relay.includes("wss://"))) {
        //         return {
        //             "error": "",
        //             "job_name": this.activity_name,
        //             "error_description": "Invalid nost relay to scrape from"
        //         }
        //     }
        // }
        return true
    }

    async data_ingestion(client, job_input, job_result){
        return true
    }

    async activity_loop(client, job_input, job_result) {
        // Create Activity to Validate Nostr Filter
        await client.query(`
            INSERT INTO nostr_scraping_jobs (
                activity_name,
                activity_input,
                activity_status,
                activity_type,
                activity_input_hash,
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            )
            RETURNING activity_id;
        `, [])
        // Add the Validate Nostr Filter as Dependency for this Activity
        // Add Scrape NostrAcitivty to Scrape Nostr
        // Add Nostr Filter as dependency to start that event
        // Add Scrape Nostr Pagiation
    }
}