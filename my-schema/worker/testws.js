
let unix_time = Math.floor((new Date()).getTime() / 1000);
let count = 0
const filter = { 
    // "ids" : ["93967226e553227a3ea2509d5e27042bca1c2c8729218e92592c73e02649b877"],
    // "since" : 123,
    // "until" : 123,
    // "kinds": [1,2,3],
    // "authors": ["asd"],
    // "limit": 123
}

// const ws = new WebSocket("wss://relay.mememaps.net")
const ws = new WebSocket("wss://relay.primal.net")


// send a subscription request for text notes from authors with my pubkey
ws.addEventListener('open', function (event) {
    ws.send('["REQ", "my-sub", ' + JSON.stringify(filter) + ']');
    console.log("event_001")
    console.log(event)
});
// print out all the returned notes
ws.addEventListener('message', function (event) {
    if (JSON.parse(event.data)[2] != null) {
        let parsed_event = JSON.parse(event.data)[2]
        console.log('Note: \n', JSON.stringify(event, null, 2))
        count++
        console.log(count)
    }
});