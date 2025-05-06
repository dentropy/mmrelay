export class Job {
    constructor(activity_name, jsonSchema) {
        this.activity_name = activity_name;
        this.jsonSchema = jsonSchema;
    }

    activity_name() {
        return this.activity_name;
    }

    jsonSchema() {
        return this.jsonSchema;
    }

}