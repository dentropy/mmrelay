// This does not reach out into the Internet to scrape data
// Spawn the activities that pagiate through a filter
// This tracks when the pagiation is done

import { Job } from './master.job.js';
import Ajv from "ajv";
export class template extends Job {
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

    async run(job_input) { }

    async data_ingestion(job_input, job_result){ }

    async activity_loop(job_input, job_result) { }

}