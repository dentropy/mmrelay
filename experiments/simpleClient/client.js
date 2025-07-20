import { v4 as uuidv4 } from 'uuid';

const ws = new WebSocket("ws://localhost:9090")

let kind_stats = {}
// send a subscription request for text notes from authors with my pubkey
ws.addEventListener('open', async function (event) {
    let count = 0
    ws.send(JSON.stringify([
        "REQ",
        String(uuidv4()),
        JSON.stringify({ kinds: [4] }),
        JSON.stringify({ kinds: [0] })
    ]));
    // while(true) {
    //     ws.send(["REQ", String(uuidv4()), JSON.stringify({})]);
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    // }
});
// print out all the returned notes
ws.addEventListener('message', function (event) {
    let parsed_event
    try {
        parsed_event = JSON.parse(String(event.data))
    } catch (error) {
        console.log(error)
        return
    }
    console.log(parsed_event)
    if (parsed_event[0] == "EVENT") {
        if (Object.keys(kind_stats).includes("kind_" + String(parsed_event[2].kind))) {
            kind_stats["kind_" + String(parsed_event[2].kind)] = kind_stats["kind_" + String(parsed_event[2].kind)] + 1
        } else {
            kind_stats["kind_" + String(parsed_event[2].kind)] = 1
        }
    }
    console.log("kind_stats")
    console.log(kind_stats)
});