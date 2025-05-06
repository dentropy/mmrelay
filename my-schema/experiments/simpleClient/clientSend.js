import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'

let sk = generateSecretKey() // `sk` is a Uint8Array
let pk = getPublicKey(sk) // `pk` is a hex string

import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'

let event = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'hello',
}, sk)

let isGood = verifyEvent(event)

console.log(event)

import { Relay } from "nostr-tools";
const relay = new Relay("ws://localhost:9090")
// const relay = new Relay("wss://relay.mememaps.net")
await relay.connect()
let answer = await relay.publish(event)

console.log("answer")
console.log(answer)
