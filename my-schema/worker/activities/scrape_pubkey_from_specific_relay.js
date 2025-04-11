import { Job } from './master.job.js';
import Ajv from "ajv";
import { nostrGet } from '../lib/nostrGet.js';
export class scrape_pubkey_from_specific_relay extends Job {
    constructor() {
        const activity_name = "scrape_pubkey_from_specific_relay"
        const jsonSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "properties": {
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
                "relays": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "limit": {
                    "type": "number"
                }
            },
            "additionalProperties": false,
            "required": [
                "authors",
                "relays"
            ]
        }
        super(activity_name, jsonSchema);
        const ajv = new Ajv({ allErrors: true });
        this.validate = ajv.compile(this.jsonSchema);
    }

    async run(job_input) {
        try {
            let filter = {}
            if ("until" in job_input) {
                filter.until = job_input.until
            }
            if ("since" in job_input) {
                filter.since = job_input.since
            }
            if ("authors" in job_input) {
                // Check all the Authors
                console.log("PAUL_WAS_HERE_2")
                for (const author of job_input.authors){
                    if(author.length != 64 && !/^[0-9a-fA-F]+$/.test(str)) {
                        return {
                            "error": "",
                            "job_name": this.activity_name,
                            "error_description": "Invalid Nostr Pubkey, remember we ingest hex keys not npubs"
                        }
                    }
                }
                filter.authors = job_input.authors
                console.log("PAUL_WAS_HERE_3")
            }
            if ("limit" in job_input) {
                filter.limit = job_input.limit
            }
            for (const relay of job_input.relays){
                if(!(relay.includes("ws://") || relay.includes("wss://"))) {
                    return {
                        "error": "",
                        "job_name": this.activity_name,
                        "error_description": "Invalid nost relay to scrape from"
                    }
                }
            }
            return await nostrGet(job_input.relays, filter)
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