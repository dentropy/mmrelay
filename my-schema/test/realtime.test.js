import { v4 as uuidv4 } from 'uuid';
import assert from "assert"
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
    wsPublish.addEventListener('open', async function (event) { })
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

describe('Array', async () => {
    // describe('#indexOf()', function () {
    //     it('should return -1 when the value is not present', function () {
    //         assert.equal([1, 2, 3].indexOf(4), -1);
    //     });
    // });
    describe('Test real time subscription of ids', async () => {
        it('We should get the Test Success Result', async function () {
            const wsPublish = new WebSocket("ws://localhost:9090")
            const wsListen = new WebSocket("ws://localhost:9090")
            let sk = generateSecretKey() // `sk` is a Uint8Array
            // let pk = getPublicKey(sk) // `pk` is a hex string
            // console.log(`pk = ${pk}`)
            let new_event = await finalizeEvent({
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: 'hello',
            }, sk)

            // Subscribe to the Event Before it is Published
            // console.log(new_event)
            wsListen.addEventListener('open', async (event) => {
                wsListen.send(JSON.stringify([
                    "REQ",
                    String(uuidv4()),
                    JSON.stringify({ ids: [new_event.id] }),
                ]));
            });
            let test_success = false
            wsListen.addEventListener('message', async (event) => {
                // console.log(`wsListen Message ${event.data}`)
                let event_data = {}
                try {
                    event_data = JSON.parse(event.data)
                    // console.log("event_data")
                    // console.log(event_data)
                    if (
                        event_data[0] == "EVENT" &&
                        event_data[2].includes(new_event.id)) {
                        test_success = true
                        // console.log("WE SHOULD PASS")
                    }
                } catch (error) {
                    // console.log(error)
                }
            })
            wsPublish.addEventListener('open', async (event) => { })
            wsPublish.addEventListener('message', async (event) => {
                // console.log(`wsPublish Message ${event.data}`)
            })
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Publish the Event
            wsPublish.send(JSON.stringify([
                "EVENT",
                JSON.stringify(new_event),
            ]));
            // console.log("SENT THE EVENT")
            await new Promise(resolve => setTimeout(resolve, 1000));
            wsListen.close()
            wsPublish.close()
            assert.equal(test_success, true);
        });
        after(() => {
            console.log('Test is finished');
            process.exit()
        });
    });
});
