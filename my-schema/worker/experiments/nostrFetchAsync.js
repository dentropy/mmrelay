import { NostrFetcher } from "nostr-fetch";
import {relays } from "../lib/relays.js"
const nHoursAgo = (hrs) =>
  Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);

const fetcher = NostrFetcher.init();
const relayUrls = [relays[1] ];

// fetches all text events since 24 hr ago in streaming manner
let count = 0
const postIter = fetcher.allEventsIterator(
    relayUrls, 
    /* filter (kinds, authors, ids, tags) */
    {  },
    /* time range filter (since, until) */
    { 
        since: nHoursAgo(24 * 2),
        until: nHoursAgo(24)
    },
    /* fetch options (optional) */
    { sort: true }
);
for await (const ev of postIter) {
    console.log(JSON.stringify(ev, null, 2));
    count += 1
    console.log(count)
}
console.log("DONE")
process.exit()
