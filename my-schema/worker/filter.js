// const filter = { 
//     "ids" : ["93967226e553227a3ea2509d5e27042bca1c2c8729218e92592c73e02649b877"],
//     "since" : 123,
//     "until" : 123,
//     "kinds": [1,2,3],
//     "authors": ["asd"],
//     "limit": 123
// }

// const filter = { 
//   "ids" : ["93967226e553227a3ea2509d5e27042bca1c2c8729218e92592c73e02649b877"],
// }

// const filter = { 
//   "since" : 0
// }

// const filter = { 
//   "until" : Math.floor((new Date()).getTime() / 1000) // Current Unix Time
// }

// const filter = { 
//   "until" : Math.floor((new Date()).getTime() / 1000), // Current Unix Time
//   limit: 100
// }

// const filter = { 
//   "kinds" : [0]
// }

// const filter = { 
//   "kinds" : [1]
// }


// const filter = { 
//   "limit" : 5
// }

// const filter = { 
//   "limit" : 5
// }

// const filter = {
//   authors: ["a44dbc9aaa357176a7d4f5c3106846ea096b66de0b50ee39aff54baab6c4bf4b"]
// }

const filter = { 
  "#e" : ["632d3544b3345f72461837e253a47c0389069602017add711e837b5a544806d4"]
}

import sql from "./db.js";

console.log(filter["ids"])

function hasTagFilter(filter){
  for(const key of Object.keys(filter)){
    if(key[0] == "#") {
      return true
    }
  }
  return false
}

function extractTagFilters(filter) {
  let tagFilters = []
  for(const key of Object.keys(filter)){
    if(key[0] == "#") {
      tagFilters.push([key.slice(1)].concat(filter[key]))
    }
  }
  return tagFilters
}

// This can actually be one single string
function writeTagSQLWhereClauses(filter){
  let filter_sql_query = "JOIN nostr_event_tags_t ON normalized_nostr_events_t.id = nostr_event_tags_t.id WHERE\n"
  for (const tmp_filter of extractTagFilters(filter)){
    filter_sql_query += ` normalized_nostr_events_t.tags LIKE '%${JSON.stringify(tmp_filter).slice(0, -1)}%' \n`
    filter_sql_query += " AND "
  }
  filter_sql_query = filter_sql_query.slice(0, -5)
  console.log("filter_sql_query")
  console.log(filter_sql_query)
  return filter_sql_query
}


let result = await sql`
  select
    normalized_nostr_events_t.raw_event
  from normalized_nostr_events_t
  ${
    hasTagFilter(filter)
      ? sql`${writeTagSQLWhereClauses(filter)}`
      : sql``
  }
  ${
    Object.keys(filter).length != 0
      ? sql` where `
      : sql``
  }
  ${
    Object.hasOwn(filter , "ids")
      ? sql`and normalized_nostr_events_t.id in ${ sql(filter["ids"]) }`
      : sql``
  }
  ${
    Object.hasOwn(filter , "kinds")
      ? sql`and normalized_nostr_events_t.kind in ${ sql(filter["kinds"]) }`
      : sql``
  }
  ${
    Object.hasOwn(filter , "since")
      ? sql`and normalized_nostr_events_t.created_at > ${ Number(filter["since"]) }`
      : sql``
  }
  ${
    Object.hasOwn(filter , "until")
      ? sql`and normalized_nostr_events_t.created_at < ${ Number(filter["until"]) }`
      : sql``
  }
  ${
    Object.hasOwn(filter , "limit")
      ? sql`order by normalized_nostr_events_t.created_at desc limit ${Number(filter["limit"])}`
      : sql`limit 500`
  }
`
console.log(result)
console.log(result.length)
