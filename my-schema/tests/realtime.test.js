import { v4 as uuidv4 } from 'uuid';
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure'

const wsPublish = new WebSocket("ws://localhost:9090")
const wsListen = new WebSocket("ws://localhost:9090")
let kind_stats = {}

async function test() {
    // Create an Event
    let sk = generateSecretKey() // `sk` is a Uint8Array
    let pk = getPublicKey(sk) // `pk` is a hex string
    console.log(`pk = ${pk}`)
    let new_event = await finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: 'hello',
    }, sk)
    let isGood = verifyEvent(new_event)

    // Subscribe to the Event Before it is Published
    console.log(new_event)
    wsListen.addEventListener('open', async function (event) {
        wsListen.send(JSON.stringify([
            "REQ",
            String(uuidv4()),
            JSON.stringify({ ids: [new_event.id] }),
        ]));
    });
    wsListen.addEventListener('message', function (event) {
        console.log(`wsListen Message ${event.data}`)
    })
    wsPublish.addEventListener('open', async function (event) {})
    wsPublish.addEventListener('message', function (event) {
        console.log(`wsPublish Message ${event.data}`)
    })
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Publish the Event
    wsPublish.send(JSON.stringify([
        "EVENT",
        JSON.stringify(new_event),
    ]));
    console.log("SENT THE EVENT")

}

test()
// // send a subscription request for text notes from authors with my pubkey
// ws.addEventListener('open', async function (event) {
//     let count = 0
//     ws.send(JSON.stringify([
//         "REQ",
//         String(uuidv4()),
//         JSON.stringify({ kinds: [4] }),
//         JSON.stringify({ kinds: [0] })
//     ]));
// });
// // print out all the returned notes
// ws.addEventListener('message', function (event) {
//     let parsed_event
//     try {
//         parsed_event = JSON.parse(String(event.data))
//     } catch (error) {
//         console.log(error)
//         return
//     }
//     console.log(parsed_event)
//     if (parsed_event[0] == "EVENT") {
//         if (Object.keys(kind_stats).includes("kind_" + String(parsed_event[2].kind))) {
//             kind_stats["kind_" + String(parsed_event[2].kind)] = kind_stats["kind_" + String(parsed_event[2].kind)] + 1
//         } else {
//             kind_stats["kind_" + String(parsed_event[2].kind)] = 1
//         }
//     }
//     console.log("kind_stats")
//     console.log(kind_stats)
// });


// wsListen.close()
// wsPublish.close()

// process.exit()