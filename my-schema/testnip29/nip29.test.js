import { v4 as uuidv4 } from 'uuid';
import assert from "assert"
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure'

const default_server_timeout_ms = 1000

const RELAY_PORT = 9091
describe('Array', async () => {
    describe('Test real time subscription of ids', async () => {
        it('We should get the Test Success Result', async function () {
const RELAY_PORT = 9091
            // const wsPublish = new WebSocket("ws://localhost:" + String(RELAY_PORT))
            const wsListen = new WebSocket("ws://localhost:"+ String(RELAY_PORT))
            let sk = generateSecretKey() // `sk` is a Uint8Array
            // let pk = getPublicKey(sk) // `pk` is a hex string

            // Subscribe to the Event Before it is Published
            // wsListen.addEventListener('open', async (event) => {
            //     wsListen.send(JSON.stringify([
            //         "REQ",
            //         String(uuidv4()),
            //         JSON.stringify({ ids: [new_event.id] }),
            //     ]));
            // });
            let challenge_string = false
            wsListen.addEventListener('message', async (event) => {
                // SHOULD GET AUTH REQUEST, and CLOSED on the other thing
                console.log(event)
                console.log(event.data)
                let event_data = {}
                try {
                    event_data = JSON.parse(event.data)
                    if (
                        event_data[0] == "AUTH" && typeof(event_data[1]) == typeof("string") 
                    )
                    {
                        challenge_string = event_data[1]
                    }
                } catch (error) { }
            })
            
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            console.log("WE GOT challenge_string")
            console.log(challenge_string)
            let new_event = await finalizeEvent({
                kind: 22242,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ["challenge",challenge_string],
                    ["relay", challenge_string]
                ],
                content: 'hello',
            }, sk)
            // Publish the Event
            wsListen.send(JSON.stringify([
                "AUTH",
                JSON.stringify(new_event),
            ]));
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            // await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            wsListen.close()
            // wsPublish.close()
            // assert.equal(test_success, true);
        });




        // after(() => {
        //     console.log('Test is finished');
        //     process.exit()
        // });
    });
})