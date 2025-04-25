import sql from "./worker/db.js";
import { NostrFetcher } from "nostr-fetch";

// Fetch filter to scrape using Update and a Return
let job_data = await sql`UPDATE scraping_nostr_filters_t
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
console.log(job_data)
// Log that we started scraping

// Loop Fetch Thing, Making sure to log each time
async function loopFetch(input_params, save_to_db_amount) {
    console.log("TODO Log Everything")
    console.log(input_params)
    const fetcher = NostrFetcher.init();
    const relayUrls = [ input_params.relay_url ];
    let events_to_save = []
    let event_ids = []
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
        event_ids.push({
            id: ev.id,
            relay_url: input_params.relay_url,
            logging_uuid: input_params.id
        })
        count += 1
        if(events_to_save.length > save_to_db_amount){
            console.log("Ingesting")
            console.log(count)
            console.log(events_to_save)
            await sql`insert into normalized_nostr_events_t ${ sql(events_to_save) } ON CONFLICT DO NOTHING;`
            await sql`insert into nostr_event_on_relay_t ${ sql(event_ids) };`

            // Track what relay we got the events from

            // Save the Logs
            const highest_created_at = Math.max(...events_to_save.map(obj => obj.created_at));
            const lowest_created_at = Math.max(...events_to_save.map(obj => obj.created_at));
            const log_data = {
                scraped_nostr_filter_id: input_params.id,
                relay_url: input_params.relay_url,
                filter_json: input_params.filter_json,
                num_results: events_to_save.length,
                since: lowest_created_at,
                until: highest_created_at,
                log_data: JSON.stringify(events_to_save)
            }
            console.log("log_data")
            console.log(log_data)
            console.log(input_params.id)
            await sql`INSERT INTO nostr_filter_scraping_logs_t ${ sql(log_data)}`
            await sql`UPDATE scraping_nostr_filters_t 
                SET ${ sql({
                num_results: count,
                since: lowest_created_at,
                until: highest_created_at
            })}
                WHERE ${sql( {id : input_params.id })}`
            events_to_save = []
        }
        // console.log(JSON.stringify(ev, null, 2));
        // console.log(count)
    }
    console.log("events_to_save.length")
    console.log(events_to_save.length)
    const highest_created_at = Math.max(...events_to_save.map(obj => obj.created_at));
    const lowest_created_at = Math.max(...events_to_save.map(obj => obj.created_at));
    await sql`UPDATE scraping_nostr_filters_t 
        SET ${ sql({
            scraping_status: count,
            since: lowest_created_at,
            until: highest_created_at,
            scraping_status: "COMPLETED"
        })}
        WHERE ${sql( {id : input_params.id })}`
    // if (events_to_save.length >= 1){
    //     console.log(events_to_save)
    //     await sql`insert into normalized_nostr_events_t ${ sql(events_to_save) } ON CONFLICT DO NOTHING;`
    // }
    // console.log("DONE")
}
await loopFetch(job_data[0], 10)

// Update everything saying we are done
await sql.end()
process.exit()