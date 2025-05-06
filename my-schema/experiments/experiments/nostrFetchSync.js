import { NostrFetcher } from "nostr-fetch";

const nHoursAgo = (hrs) =>
  Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);

const fetcher = NostrFetcher.init();
const relayUrls = [ "wss://relay.mememaps.net" ];

// fetches all text events since 24 hr ago, as a single array
const allPosts = await fetcher.fetchAllEvents(
    relayUrls,
    /* filter */
    { },
    /* time range filter */
    { 
        since: nHoursAgo(24 * 2),
        until: nHoursAgo(24)
    },
    /* fetch options (optional) */
    { sort: true }
)
console.log(allPosts)
console.log(allPosts.length)
