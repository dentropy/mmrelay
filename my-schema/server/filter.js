// const filter = {
//     "ids" : ["93967226e553227a3ea2509d5e27042bca1c2c8729218e92592c73e02649b877"],
//     "since" : 123,
//     "until" : 123,
//     "kinds": [1,2,3],
//     "authors": ["asd"],
//     "limit": 123
// }

// const filter = {}

// const filter = {
//   "ids" : ["93967226e553227a3ea2509d5e27042bca1c2c8729218e92592c73e02649b877"],
// }

// const filter = {
//   "since" : 0
// }

// const filter = {
//   "until" : Math.floor((new Date()).getTime() / 1000) // Current Unix Time
// }

const filter = {
  "until" : Math.floor((new Date()).getTime() / 1000), // Current Unix Time
  limit: 100
}

// const filter = {
//   "kinds" : [4]
// }

// const filter = {
//   "kinds" : [1]
// }

// const filter = {
//   "limit" : 5
// }

// const filter = {
//   authors: ["0a69cf2560597cd4dfff9a75f40261d902a91b139cdacea10d54a52b43219250"]
// }

// const filter = {
//     "#e": ["632d3544b3345f72461837e253a47c0389069602017add711e837b5a544806d4"],
// };


import sql from "../worker/db.js";

function hasTagFilter(filter) {
    for (const key of Object.keys(filter)) {
        if (key[0] == "#") {
            return true;
        }
    }
    return false;
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
console.log("Complete")
console.log(results[0]);
console.log(results.length);

// for(const result of results){
//     let new_result = JSON.parse(result.raw_event)
//     if(new_result.kind != 4) {
//         console.log(new_result)
//     }
// }

