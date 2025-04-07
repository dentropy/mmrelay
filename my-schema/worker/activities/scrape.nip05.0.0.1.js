import { Job } from './master.job.js';
import Ajv from "ajv";

export class scrape_nip05_0_0_1 extends Job {
    constructor() {
        const activity_name = "scrape.nip05.0.0.1"
        const jsonSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "properties": {
                "internet_identifier": {
                    "type": "string"
                }
            },
            "additionalProperties": false,
            "required": [
                "internet_identifier"
            ]
        }
        super(activity_name, jsonSchema);
        const ajv = new Ajv({ allErrors: true });
        this.validate = ajv.compile(this.jsonSchema);
    }

    async run(job_input) {
        // Check for the @ symbol
        if (!job_input.internet_identifier.includes("@")) {
            return {
                "error": "",
                "job_name": this.name,
                "error_description": "Not a valid internet identifier"
            }
        }
        // Get the Username and Domain Name
        const split_job_input = job_input.internet_identifier.split("@")
        if (split_job_input.length < 2) {
            return {
                "error": "",
                "job_name": this.activity_name,
                "error_description": "Could not parse internet identifier"
            }
        }
        const username = split_job_input[0]
        const domain_name = split_job_input[1]
        // Generate the .well-known/nostr.json URL
        // Example https://primal.net/.well-known/nostr.json?name=jack
        let url = `https://${domain_name}/.well-known/nostr.json?name=${username}`
        // Fetch the .well-known/nostr.json URL
        let response_data = ""
        try {
            const response = await fetch(url);
            response_data = await response.json();
        } catch (error) {
            return {
                "error": "",
                "job_name": this.activity_name,
                "error_description": "Could not fetch internet identifier",
                "raw_error": JSON.stringify(error)
            }
        }
        // Validate Response
        if ( !("names" in response_data) ){
            return {
                "error": "",
                "job_name": this.activity_name,
                "error_description": "'names' is not in json response",
            }
        }
        if (
            Object.keys(response_data).includes(username) || 
            Object.keys(response_data).includes("_")
        ){
            return {
                "error": "",
                "job_name": this.activity_name,
                "error_description": "Could not validate Username",
            }
        }
        // Report results to the Database
        return {
            "success": "",
            "job_name": this.activity_name,
            "data": response_data
        }
    }
}
