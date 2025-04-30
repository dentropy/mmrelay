const ws = new WebSocket("ws://localhost:9090")


// send a subscription request for text notes from authors with my pubkey
ws.addEventListener('open', async function (event) {
    let count = 0
    while(true) {
        ws.send(`Hello World ${count++}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
});
// print out all the returned notes
ws.addEventListener('message', function (event) {
    console.log(event)
    console.log(event.data)
});