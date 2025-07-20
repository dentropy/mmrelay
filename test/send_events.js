const default_server_timeout_ms = 1000
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'


const wsListen = new WebSocket("ws://localhost:9090")
// const wsListen = new WebSocket("wss://relay.mememaps.net")

let sk = generateSecretKey() // `sk` is a Uint8Array
let pk = getPublicKey(sk) // `pk` is a hex string
let new_event = await finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: 'hello',
}, sk)
let new_event2 = await finalizeEvent({
    kind: 0,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify({
        aid : "newatlantis",
        name: "newatlantis",
        display_name: "newatlantis",
        // nip05: "greg.apt"
    }),
}, sk)
await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
wsListen.send(JSON.stringify([
    "EVENT",
    new_event,
]));
wsListen.send(JSON.stringify([
    "EVENT",
    new_event2,
]));
await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
wsListen.close()
let npub = nip19.npubEncode(pk)
console.log(npub)
let nsec= nip19.nsecEncode(sk)
console.log(nsec)
