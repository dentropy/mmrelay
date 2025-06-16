import { v4 as uuidv4 } from 'uuid';
import assert from "assert"
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure'

// const wsPublish = new WebSocket("ws://localhost:9090")
// let kind_stats = {}

const wsListen = new WebSocket("https://t.mememap.net/")
// const wsListen = new WebSocket("http://localhost:9091")


wsListen.addEventListener('open', async function (event) {
    wsListen.send(JSON.stringify([
        "REQ",
        String(uuidv4()),
        { kinds: [999]},
    ]));
});
wsListen.addEventListener('message', function (event) {
    console.log(`wsListen Message ${event.data}`)
    console.log(JSON.stringify(JSON.parse(event.data), null, 2))
})