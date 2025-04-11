import { Job } from './master.job.js';
import Ajv from "ajv";

export class scrape_pubkey_from_specific_relay extends Job {
    constructor() {
        const activity_name = "scrape_pubkey_from_specific_relay"
        const jsonSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "properties": {
                "before-unix-timestamp": {
                    "type": "number"
                },
                "after-unix-timestamp": {
                    "type": "number"
                },
                "pubkey": {
                    "type": "string"
                },
                "relay": {
                    "type": "string"
                },
                "limit": {
                    "type": "number"
                }
            },
            "additionalProperties": false,
            "required": [
                "pubkey",
                "relay"
            ]
        }
        super(activity_name, jsonSchema);
        const ajv = new Ajv({ allErrors: true });
        this.validate = ajv.compile(this.jsonSchema);
    }

    async run(job_input) {
        // Validate that pubkey is a pubkey
        // Validate the the relay is a websocket URL
        // Scrape the events using NostrGet
        // Log response to database
        // Log events to database
        // Log the relay the events were retrieved from in database
        // Scape more events if the number of returned events is the same as the limit input

    }
}