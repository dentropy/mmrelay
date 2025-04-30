import { WebSocketServer } from 'ws';
import Ajv from "ajv";
import sql from "../worker/db.js";
const wss = new WebSocketServer({ port: 9090 });

let subscriptions = {}


let nostr_filter_json_schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
      "ids": {
          "type": "array",
          "items": {
              "type": "string"
          }
      },
      "since": {
          "type": "integer"
      },
      "until": {
          "type": "integer"
      },
      "kinds": {
          "type": "array",
          "items": {
              "type": "integer"
          }
      },
      "authors": {
          "type": "array",
          "items": {
              "type": "string"
          }
      },
      "limit": {
          "type": "integer"
      }
  },
  "additionalProperties": true,
}
const ajv = new Ajv({ allErrors: true });
const filter_validate = ajv.compile(nostr_filter_json_schema);

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
    console.log('received: %s', data);
    console.log(typeof(data))
    let json_parsed_data = {}
    try {
      json_parsed_data = JSON.parse(String(data))
    } catch (error) {
      ws.send(JSON.stringify(["NOTICE", `Unable to process process JSON Data you provided,\n${data}\n\nCheck the Nostr Docs https://github.com/nostr-protocol/nips/blob/master/01.md`]));
      return
    }
    console.log("json_parsed_data")
    console.log(json_parsed_data)
    try {
      if ((json_parsed_data[0] in ["EVENT", "REQ", "CLOSE"])){
        ws.send(JSON.stringify(["NOTICE", `Unable to process process JSON Data you provided Please provide a list with the first item being "EVENT", "REQ"\n${data}\n\nCheck the Nostr Docs https://github.com/nostr-protocol/nips/blob/master/01.md`]));
        return
      }
    } catch (error) {
      ws.send(JSON.stringify(["NOTICE", `Unable to process process JSON Data you provided Please provide a list,\n${data}\n\nCheck the Nostr Docs https://github.com/nostr-protocol/nips/blob/master/01.md`]));
    }
    if (json_parsed_data[0] == "REQ") {
      if(json_parsed_data.length < 3){
        ws.send(JSON.stringify(["NOTICE", `REQ with subscription_id=${json_parsed_data[2]} does not have the correct number of arguments, needs three strings`]));
        return
      }
      if(Object.keys(subscriptions).includes(json_parsed_data[2])){
        ws.send(JSON.stringify(["NOTICE", `REQ with subscription_id=${json_parsed_data[2]} is already taken please choose another one`]));
        return
      }
      // Validate Filter
      let filter = json_parsed_data[2]
      console.log("My Filter")
      console.log(filter)
      if(filter_validate(json_parsed_data[2])){
        ws.send(JSON.stringify(["NOTICE", `REQ with subscription_id=${json_parsed_data[2]} has an invalid filter`]));
        return
      }
      subscriptions[json_parsed_data[1]] = {
        filters: [ json_parsed_data[2] ],
        created_at: new Date()
      }
      function extractTagFilters(filter) {
        let tagFilters = [];
        for (const key of Object.keys(filter)) {
            if (key[0] == "#") {
                tagFilters.push(String("%" + JSON.stringify([key.slice(1)].concat(filter[key])).slice(0, -1)+ "%"));
            }
        }
        return tagFilters;
    }
    const conditions = extractTagFilters(filter).map((value) => sql` AND normalized_nostr_events_t.tags LIKE ${value} `);
    let results = await sql`
        select
          normalized_nostr_events_t.raw_event
        from normalized_nostr_events_t
        WHERE 1 = 1
        ${Object.hasOwn(filter, "ids")
            ? sql` and normalized_nostr_events_t.id in ${sql(filter["ids"])}`
            : sql``
        }
        ${Object.hasOwn(filter, "kinds")
            ? sql` and normalized_nostr_events_t.kind in ${sql(filter["kinds"])}`
            : sql``
        }
        ${Object.hasOwn(filter, "since")
            ? sql` and normalized_nostr_events_t.created_at > ${Number(filter["since"])
                }`
            : sql``
        }
        ${Object.hasOwn(filter, "until")
            ? sql` and normalized_nostr_events_t.created_at < ${Number(filter["until"])
                }`
            : sql``
        }
        ${extractTagFilters(filter).length < 10 && extractTagFilters(filter).length >= 1
            ? sql`${conditions}`
            : sql``
        }
        ${Object.hasOwn(filter, "limit")
            ? sql`order by normalized_nostr_events_t.created_at desc limit ${Number(filter["limit"])
                }`
            : sql`limit 500`
        }
      `;
      for( const result of results) {
        ws.send(JSON.stringify(["EVENT", json_parsed_data[2], result.raw_event]))
      }
      ws.send(JSON.stringify(["CLOSED", json_parsed_data[2], "We don't have EOSE implimented"]))
      delete subscriptions[json_parsed_data[1]]

    }
    // Process the REQ filter
      // If the Filter ID is already being used throw an Error
      // Validate the Filter
    // Perform SQL Query With Filter
    // Return Results via ws.send
    // Send CLOSE cause EOSE is not supported, maybe send a NOTICE

    // TODO Accept new EVENTS
    if (json_parsed_data[0] == "EVENT") {
      // Accept EVENT
      // Send OK Message Back
      ws.send(JSON.stringify(["NOTICE", `EVENT message is not supported yet, You can't send events to this relay`]));
    }


    ws.send('something');
  });

  ws.send('Connected');
});