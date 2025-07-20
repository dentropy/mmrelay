// This does not reach out into the Internet to scrape data
// This helps track the pagiation of the Nostr filter
// It also updates the root job when the pagiation loop is completed

import { Job } from './master.job.js';
import Ajv from "ajv";
import { nostrGet } from '../lib/nostrGet.js';
export class scrape_nostr_filter_pagiated_function extends Job {
    constructor() {
        const activity_name = "scrape_nostr_filter_pagiated_function"
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
                    "authors":     {
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
                },
                "current_recusion": {
                    "type": "number"
                }
            },
            "additionalProperties": false,
            "required": [
                "filter",
                "relays",
                "max_recursion",
                "current_recusion"
            ]
        }
        super(activity_name, jsonSchema);
        const ajv = new Ajv({ allErrors: true });
        this.validate = ajv.compile(this.jsonSchema);
    }

    async run(job_input) {
        // If no limit on the filter add one
    }

    async data_ingestion(client, job_input, job_result){
        return true
    }

    async activity_loop(client, job_input, job_result) {
        // If the number of results is less than the limit in job_input, update the task saying done
        // Else Get the smallest timestamp from job_result and create new filter and resubmit job
    }
    
}