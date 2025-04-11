import { SimplePool } from "nostr-tools/pool";
export async function nostrGet(relays, filter) {
  const pool = new SimplePool();
  const events = await pool.querySync(relays, filter);
  return events;
}

// [Filter - @nostr/tools - JSR](https://jsr.io/@nostr/tools@2.12.0/doc/~/Filter)
// console.log(await nostrGet(["wss://relay.mememaps.net"], {
//   authors: ["2cd173ccf1b7fdf150177961442091e3c0273fd96d815113d8fefe24efcd65f8"],
//   since: 1644340921,
//   limit: 3
// }))