import { v4 as uuidv4 } from 'uuid';
import assert from "assert"
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure'

// const wsPublish = new WebSocket("ws://localhost:9090")
// let kind_stats = {}

const wsListen = new WebSocket("https://archive.mememaps.net/")
// const wsListen = new WebSocket("http://localhost:9090")


wsListen.addEventListener('open', async function (event) {
    wsListen.send(JSON.stringify([
        "REQ",
        String(uuidv4()),
        { search: "bitcoin" },
    ]));
});
wsListen.addEventListener('message', function (event) {
    console.log(`wsListen Message ${event.data}`)
})