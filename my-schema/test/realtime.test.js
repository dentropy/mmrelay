import { v4 as uuidv4 } from 'uuid';
import assert from "assert"
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure'

const default_server_timeout_ms = 150

describe('Array', async () => {
    describe('Test real time subscription of ids', async () => {
        it('We should get the Test Success Result', async function () {
            const wsPublish = new WebSocket("ws://localhost:9090")
            const wsListen = new WebSocket("ws://localhost:9090")
            let sk = generateSecretKey() // `sk` is a Uint8Array
            // let pk = getPublicKey(sk) // `pk` is a hex string
            let new_event = await finalizeEvent({
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: 'hello',
            }, sk)

            // Subscribe to the Event Before it is Published
            wsListen.addEventListener('open', async (event) => {
                wsListen.send(JSON.stringify([
                    "REQ",
                    String(uuidv4()),
                    JSON.stringify({ ids: [new_event.id] }),
                ]));
            });
            let test_success = false
            wsListen.addEventListener('message', async (event) => {
                let event_data = {}
                try {
                    event_data = JSON.parse(event.data)
                    if (
                        event_data[0] == "EVENT" &&
                        event_data[2].includes(new_event.id)) {
                        test_success = true
                    }
                } catch (error) { }
            })
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            // Publish the Event
            wsPublish.send(JSON.stringify([
                "EVENT",
                JSON.stringify(new_event),
            ]));
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            wsListen.close()
            wsPublish.close()
            assert.equal(test_success, true);
        });
        // after(() => {
        //     console.log('Test is finished');
        //     process.exit()
        // });
    });
    describe('Test real time subscription of authors', async () => {
        it('We should get the Test Success Result', async function () {
            const wsPublish = new WebSocket("ws://localhost:9090")
            const wsListen = new WebSocket("ws://localhost:9090")
            let sk = generateSecretKey() // `sk` is a Uint8Array
            let pk = getPublicKey(sk) // `pk` is a hex string
            let new_event = await finalizeEvent({
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: 'hello',
            }, sk)

            // Subscribe to the Event Before it is Published
            wsListen.addEventListener('open', async (event) => {
                wsListen.send(JSON.stringify([
                    "REQ",
                    String(uuidv4()),
                    JSON.stringify({ authors: [pk] }),
                ]));
            });
            let test_success = false
            wsListen.addEventListener('message', async (event) => {
                let event_data = {}
                try {
                    event_data = JSON.parse(event.data)
                    if (
                        event_data[0] == "EVENT" &&
                        event_data[2].includes(new_event.id)) {
                        test_success = true
                    }
                } catch (error) { }
            })
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            // Publish the Event
            wsPublish.send(JSON.stringify([
                "EVENT",
                JSON.stringify(new_event),
            ]));
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            wsListen.close()
            wsPublish.close()
            assert.equal(test_success, true);
        })
    })
    describe('Test real time subscription of kinds', async () => {
        it('We should get the Test Success Result', async function () {
            const wsPublish = new WebSocket("ws://localhost:9090")
            const wsListen = new WebSocket("ws://localhost:9090")
            let sk = generateSecretKey() // `sk` is a Uint8Array
            let pk = getPublicKey(sk) // `pk` is a hex string
            let new_event = await finalizeEvent({
                kind: 69420,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: 'hello',
            }, sk)

            // Subscribe to the Event Before it is Published
            wsListen.addEventListener('open', async (event) => {
                wsListen.send(JSON.stringify([
                    "REQ",
                    String(uuidv4()),
                    JSON.stringify({ kinds: [69420] }),
                ]));
            });
            let test_success = false
            wsListen.addEventListener('message', async (event) => {
                let event_data = {}
                try {
                    event_data = JSON.parse(event.data)
                    if (
                        event_data[0] == "EVENT" &&
                        event_data[2].includes(new_event.id)) {
                        test_success = true
                    }
                } catch (error) { }
            })
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            // Publish the Event
            wsPublish.send(JSON.stringify([
                "EVENT",
                JSON.stringify(new_event),
            ]));
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            wsListen.close()
            wsPublish.close()
            assert.equal(test_success, true);
        })
    })
    describe('Test real time subscription of tags', async () => {
        it('We should get the Test Success Result', async function () {
            const wsPublish = new WebSocket("ws://localhost:9090")
            const wsListen = new WebSocket("ws://localhost:9090")
            let sk = generateSecretKey() // `sk` is a Uint8Array
            let pk = getPublicKey(sk) // `pk` is a hex string
            let new_event = await finalizeEvent({
                kind: 69420,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ["aa", "hello", "world"]
                ],
                content: 'hello',
            }, sk)

            // Subscribe to the Event Before it is Published
            wsListen.addEventListener('open', async (event) => {
                wsListen.send(JSON.stringify([
                    "REQ",
                    String(uuidv4()),
                    JSON.stringify({ "#aa" : ["hello"] }),
                ]));
            });
            let test_success = false
            wsListen.addEventListener('message', async (event) => {
                let event_data = {}
                try {
                    event_data = JSON.parse(event.data)
                    if (
                        event_data[0] == "EVENT" &&
                        event_data[2].includes(new_event.id)) {
                        test_success = true
                    }
                } catch (error) { }
            })
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            // Publish the Event
            wsPublish.send(JSON.stringify([
                "EVENT",
                JSON.stringify(new_event),
            ]));
            await new Promise(resolve => setTimeout(resolve, default_server_timeout_ms));
            wsListen.close()
            wsPublish.close()
            assert.equal(test_success, true);
        })
    })
})
