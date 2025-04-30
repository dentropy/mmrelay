import { v4 as uuidv4 } from 'uuid';

const ws = new WebSocket("ws://localhost:9090")

// send a subscription request for text notes from authors with my pubkey
ws.addEventListener('open', async function (event) {
    let count = 0
    ws.send(JSON.stringify(["REQ", String(uuidv4()), JSON.stringify({kinds:[4]})]));
    // while(true) {
    //     ws.send(["REQ", String(uuidv4()), JSON.stringify({})]);
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    // }
});
// print out all the returned notes
ws.addEventListener('message', function (event) {
    console.log(event)
    console.log(event.data)
});