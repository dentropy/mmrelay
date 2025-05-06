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
            },
            "additionalProperties": false,
            "required": [
                "filter",
            ]
        }
        super(activity_name, jsonSchema);
        const ajv = new Ajv({ allErrors: true });
        this.validate = ajv.compile(this.jsonSchema);
    }

    async run(job_input) {
        try {
            if ("authors" in job_input.filter) {
                // Check all the Authors
                for (const author of job_input.filter.authors) {
                    if (author.length != 64 && !/^[0-9a-fA-F]+$/.test(str)) {
                        return {
                            "error": "",
                            "job_name": this.activity_name,
                            "error_description": "Invalid Nostr Pubkey, remember we ingest hex keys not npubs"
                        }
                    }
                }
            }
            job_input.filter = filter
            return job_input
        } catch (error) {
            console.log(error)
            return {
                "error": "",
                "job_name": this.activity_name,
                "error_description": "Problem resolving the Nostr Relay",
                "raw_error": JSON.stringify(error)
            }
        }
    }
}