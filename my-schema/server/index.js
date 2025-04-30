import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 9090 });

let subscriptions = {}

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
    let json_parsed_data = {}
    try {
      json_parsed_data = JSON.stringify(data)
    } catch (error) {
      ws.send(JSON.stringify(["NOTICE", `Unable to process process JSON Data you provided,\n${data}\n\nCheck the Nostr Docs https://github.com/nostr-protocol/nips/blob/master/01.md`]));
      return
    }
    try {
      if (!(json_parsed_data[0] in ["EVENT", "REQ", "CLOSE"])){
        ws.send(JSON.stringify(["NOTICE", `Unable to process process JSON Data you provided Please provide a list with the first item being "EVENT", "REQ"\n${data}\n\nCheck the Nostr Docs https://github.com/nostr-protocol/nips/blob/master/01.md`]));
        return
      }
    } catch (error) {
      ws.send(JSON.stringify(["NOTICE", `Unable to process process JSON Data you provided Please provide a list,\n${data}\n\nCheck the Nostr Docs https://github.com/nostr-protocol/nips/blob/master/01.md`]));
    }
    if (json_parsed_data[0] == "REQ") {

    }
    // Process the REQ filter
      // If the Filter ID is already being used throw an Error
      // Validate the Filter
    // Perform SQL Query With Filter
    // Return Results via ws.send
    // Send CLOSE cause EOSE is not supported, maybe send a NOTICE

    // TODO Accept new EVENTS
    if (json_parsed_data[0] == "EVENT") {
      // Accept EVENT
      // Send OK Message Back
      ws.send(JSON.stringify(["NOTICE", `EVENT message is not supported yet, You can't send events to this relay`]));
    }


    ws.send('something');
  });

  ws.send('Connected');
});