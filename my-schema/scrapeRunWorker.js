import sql from "./worker/db.js";
import { NostrFetcher } from "nostr-fetch";

// Fetch filter to scrape using Update and a Return
let result = await sql`UPDATE scraping_nostr_filters_t
SET 
    scraping_status = 'RUNNING'
WHERE id = (
    SELECT id
    FROM scraping_nostr_filters_t
    WHERE 
        scraping_status = 'TODO'
    ORDER BY created_at DESC
    LIMIT 1
)
RETURNING *;`
console.log(result)
// Log that we started scraping

// Loop Fetch Thing, Making sure to log each time
async function loopFetch(input_params, save_to_db_amount) {
    console.log("TODO Log Everything")
    console.log(input_params)
    const fetcher = NostrFetcher.init();
    const relayUrls = [ input_params.relay_url ];
    let events_to_save = []
    
    // fetches all text events since 24 hr ago in streaming manner
    let count = 0
    const postIter = fetcher.allEventsIterator(
        relayUrls, 
        /* filter (kinds, authors, ids, tags) */
        input_params.filter_json,
        /* time range filter (since, until) */
        { 
            // since: nHoursAgo(24 * 2),
            until: Math.floor((new Date()).getTime() / 1000)
        },
        /* fetch options (optional) */
        { sort: true }
    );
    for await (let ev of postIter) {
        ev.raw_event = JSON.stringify(ev)
        ev.is_verified = false
        delete ev.seenOn
        // console.log("ev")
        // console.log(ev)
        events_to_save.push(ev)
        count += 1
        if(events_to_save.length >= save_to_db_amount){
            console.log("Ingesting")
            console.log(count)
            console.log(events_to_save)
            await sql`insert into normalized_nostr_events_t ${ sql(events_to_save) } ON CONFLICT DO NOTHING;`
            events_to_save = []
            // Save a Log
            // Update the Scrape with the smallest created_at value
        }
        // console.log(JSON.stringify(ev, null, 2));
        // console.log(count)
    }
    console.log("events_to_save.length")
    console.log(events_to_save.length)
    if (events_to_save.length >= 1){
        console.log(events_to_save)
        await sql`insert into normalized_nostr_events_t ${ sql(events_to_save) } ON CONFLICT DO NOTHING;`
    }
    console.log("DONE")
}
await loopFetch(result[0], 10)

// Update everything saying we are done
await sql.end()
process.exit()