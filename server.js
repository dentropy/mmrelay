// TEST
import { WebSocketServer } from 'ws';
import Ajv from "ajv";
import { verifyEvent } from 'nostr-tools/pure'
import postgres from 'postgres'
import fs from 'fs';

const sql = await postgres(
  process.env.PG_CONN_STRING, {
  ssl: false
  // ssl: { rejectUnauthorized: false }
})


// For some reason this doesn't want to work we use postgres init script in docker-compose instead
// let schema = fs.readFileSync('./database/schema.sql', "utf-8")
// for (const table of schema.split("\n\n")){
//   console.log(`${table}`)
//   try {
//      await sql`${table}` 
//   } catch (error) {
//     console.log(error)
//   }
// }


const PORT = process.env.PORT || 9090;
const wss = new WebSocketServer({ port: PORT });
let subscriptions = {}

function extractTagFilters(filter) {
  let tagFilters = [];
  for (const key of Object.keys(filter)) {
    if (key[0] == "#") {
      tagFilters.push(String("%" + JSON.stringify([key.slice(1)].concat(filter[key])).slice(0, -1) + "%"));
    }
  }
  return tagFilters;
}

function extractTagFiltersJSON(filter) {
  let tagFilters = [];
  for (const key of Object.keys(filter)) {
    if (key[0] == "#") {
      tagFilters.push(JSON.stringify([key.slice(1)].concat(filter[key])).slice(0, -1));
    }
  }
  return tagFilters;
}

function filter_event_validaor(filter, event) {
  if (filter.authors != undefined) {
    if (filter.authors.includes(event.pubkey)) {
      return true
    }
  }
  if (filter.ids != undefined) {
    if (filter.ids.includes(event.id)) {
      return true
    }
  }
  if (filter.kinds != undefined) {
    if (filter.kinds.includes(event.kind)) {
      return true
    }
  }
  if (filter.since != undefined) {
    if (event.created_at < filter.since) {
      return true
    }
  }
  if (filter.until != undefined) {
    if (event.created_at > filter.until) {
      return true
    }
  }
  const extracted_tags = extractTagFiltersJSON(filter)
  if (extracted_tags.length > 0) {
    if (event.tags.length > 0 && extracted_tags.length > 0) {
      for (const event_tag of JSON.parse(event.tags)) {
        for (const filter_tag of extracted_tags) {
          if (JSON.stringify(event_tag).includes(filter_tag)) {
            return true
          }
        }
      }
    }
  }
}

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

const ajv = new Ajv({ allErrors: true })
const filter_validate = ajv.compile(nostr_filter_json_schema)

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
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
      if (json_parsed_data[0] in ["EVENT", "REQ", "CLOSE"]) {
        ws.send(JSON.stringify(["NOTICE", `Unable to process process JSON Data you provided Please provide a list with the first item being "EVENT", "REQ"\n${data}\n\nCheck the Nostr Docs https://github.com/nostr-protocol/nips/blob/master/01.md`]));
        return
      }
    } catch (error) {
      ws.send(JSON.stringify(["NOTICE", `Unable to process process JSON Data you provided Please provide a list,\n${data}\n\nCheck the Nostr Docs https://github.com/nostr-protocol/nips/blob/master/01.md`]));
    }
    // Process the REQ filter
    if (json_parsed_data[0] == "REQ") {
      let filter_json = json_parsed_data[2]
      console.log("PAUL_WAS_HERE_REQ")
      console.log(filter_json)
      if (json_parsed_data.length < 3) {
        ws.send(JSON.stringify(["NOTICE", `REQ with subscription_id=${filter_json} does not have the correct number of arguments, needs three strings`]));
        return
      }
      if (Object.keys(subscriptions).includes(json_parsed_data[2])) {
        ws.send(JSON.stringify(["NOTICE", `REQ with subscription_id=${filter_json} is already taken please choose another one`]));
        return
      }
      console.log("PAUL_FILTERS_0")
      console.log(filter_json)
      // Validate Filter
      if (!filter_validate(filter_json)) {
        ws.send(JSON.stringify(["NOTICE", `REQ with subscription_id=${filter_json} has an invalid filter`]));
        return
      }
      let subscription_id = String(json_parsed_data[1])
      json_parsed_data.splice(0, 2)
      let filters = json_parsed_data
      console.log("PAUL_FILTERS")
      console.log(filters)
      if (filters.length != undefined) {
        filters.forEach((item, index) => filters[index] = filters[index]);
        for (const filter of filters) {
          console.log("FILTER")
          console.log(filter)
          if (!filter_validate(filter)) {
            ws.send(JSON.stringify(["NOTICE", `REQ with subscription_id=${filter} has an invalid filter`]));
            return
          }
        }
      }
      subscriptions[subscription_id] = {
        subscription_id: subscription_id,
        filters: filters,
        created_at: new Date(),
        ws: ws
      }
      ws.subscription_id = subscription_id
      console.log("subscriptions")
      console.log(subscriptions)
      try {
        for (const filter of filters) {
          const conditions = extractTagFilters(filter).map((value) => sql` AND normalized_nostr_events_t.tags LIKE ${value} `);
          let results = await sql`
        select
          normalized_nostr_events_t.raw_event
        from normalized_nostr_events_t
        ${Object.hasOwn(filter, "search")
              ? sql` JOIN nostr_event_content_indexed ON normalized_nostr_events_t.id = nostr_event_content_indexed.id`
              : sql``
            }
        WHERE 1 = 1
        ${Object.hasOwn(filter, "search")
              ? sql` and nostr_event_content_indexed.search_vector @@ websearch_to_tsquery('english', ${filter.search})`
              : sql``
            }
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
        ${Object.hasOwn(filter, "authors")
              ? sql` and normalized_nostr_events_t.pubkey = ${filter["authors"][0]}`
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
          console.log(results)
          for (const result of results) {
            let raw_event = JSON.parse(result.raw_event)
            delete raw_event.num_tags
            delete raw_event.is_verified
            ws.send(JSON.stringify(["EVENT", subscription_id, raw_event]))
          }
        }
      } catch (error) {
        console.log(error)
        ws.send(JSON.stringify(["NOTICE", `Could not Process Event`]))
        return
      }
      // ws.send(JSON.stringify(["CLOSED", subscription_id, "We don't have EOSE implimented"]))
      // delete subscriptions[subscription_id]
      ws.send(JSON.stringify(["EOSE", subscription_id]))
    }

    if (json_parsed_data[0] == "EVENT") {
      if (json_parsed_data.length != 2) {
        ws.send(JSON.stringify(["NOTICE", `The EVENT message you sent is not a JSON list of length 2`]));
        return
      }
      console.log("EVENT_DATA")
      let event_json = {}
      try {
        event_json = json_parsed_data[1]
      } catch (error) {
        ws.send(JSON.stringify(["NOTICE", `Could not Parse JSON of Event`]))
        return
      }
      try {
        if (!verifyEvent(json_parsed_data[1])) {
          ws.send(JSON.stringify(["NOTICE", `Could not verify the event`]))
          return
        }
      } catch (error) {
        ws.send(JSON.stringify(["NOTICE", `Could not verify the event`]))
        return
      }
      var new_event = event_json
      new_event.raw_event = JSON.stringify(json_parsed_data[1])
      new_event.num_tags = new_event.tags.length
      new_event.is_verified = true
      new_event.tags = JSON.stringify(event_json.tags)
      ws.send(JSON.stringify(["OK", event_json.id, true, ""]))
      try {
        await sql`insert into normalized_nostr_events_t ${sql([new_event])} ON CONFLICT DO NOTHING;`
      } catch (error) {
        console.log("ERROR INSERTING INTO DATABASE")
        console.log(JSON.stringify(new_event))
        console.log(error)
        ws.send(JSON.stringify(["NOTICE", `Error inserting into database`]))
        return
      }


      // Full Text Search Functionality
      let nostr_events_content_indexed = []
      if ([1, 10002].includes(new_event.kind) && new_event.content.length != 0) {
        let event_to_index = {}
        event_to_index.id = new_event.id
        event_to_index.content = new_event.content
        if (new_event.tags.includes("title")) {
          try {
            let tags = JSON.parse(new_event.tags)
            for (const tag of tags) {
              if (tag[0] == "title") {
                event_to_index.title = tag[1]
                event_to_index.search_vector += "Title " + tag[1]
              }
            }
          } catch (error) {
            console.log(`Error processing title: ${new_event.id}`)
          }
        }
        try {
          await sql`insert into normalized_nostr_events_t ${sql([new_event])} ON CONFLICT DO NOTHING;`
        } catch (error) {
          console.log("ERROR INSERTING INTO DATABASE")
          console.log(JSON.stringify(new_event))
          console.log(error)
          ws.send(JSON.stringify(["NOTICE", `Error inserting into database`]))
          return
        }
        if (new_event.tags.includes("summary")) {
          try {
            let tags = JSON.parse(nostr_event.tags)
            for (const tag of tags) {
              if (tag[0] == "summary") {
                event_to_index.title = tag[1]
                event_to_index.search_vector += "\nSummary " + tag[1]
              }
            }
          } catch (error) {
            console.log(`Error processing summary: ${new_event.id}`)
          }
        }
        nostr_events_content_indexed.push(event_to_index)
        console.log(`nostr_events_content_indexed.length = ${nostr_events_content_indexed.length}`)
        if (nostr_events_content_indexed.length >= 1) {
          try {
            await sql`insert into nostr_event_content_indexed ${sql(nostr_events_content_indexed)} ON CONFLICT DO NOTHING;`
          } catch (error) {
            console.log("INSERT tsvector error")
            console.log(error)
          }
        }



      }
      for (const subscription of Object.keys(subscriptions)) {
        for (const filter of subscriptions[subscription].filters) {
          if (filter_event_validaor(filter, new_event)) {
            console.log("IN EVNET SUBSCRIPTIONS")
            console.log(subscriptions)
            subscriptions[subscription].ws.send((JSON.stringify(["EVENT", subscription, JSON.parse(json_parsed_data[1].raw_event)])))
            break
          }
        }
      }
    }
    if (json_parsed_data[0] == "CLOSE") {
      console.log("RECIEVED_CLOSE_MESSAGE")
      console.log(json_parsed_data)
      // ws.send(JSON.stringify(["NOTICE", `CLOSE message is not supported yet, you can't subscribe to real time EVENTS yet`]))
    }
  })
  ws.on('close', async function closeWS() {
    delete subscriptions[ws.subscription_id]
  })
})

console.log(`Server Started Successfully on PORT = ${PORT}`)