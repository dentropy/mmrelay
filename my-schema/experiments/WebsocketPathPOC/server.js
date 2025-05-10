import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const server = createServer();
const wss1 = new WebSocketServer({ noServer: true });
const wss2 = new WebSocketServer({ noServer: true });

wss1.on('connection', (ws) => {
  ws.on('error', console.error);
  ws.on('message', (message) => {
    ws.on('error', console.error);
    ws.send("wss1 foo message works");
  });
  console.log(Object.keys(ws))
  ws.send("wss1 foo connection works")
});


wss2.on('connection', (ws) => {
  ws.on('error', console.error);
  ws.on('message', (message) => {
    ws.on('error', console.error);
    ws.send("wss2 bar message works");
  });
  console.log(Object.keys(ws))
  ws.send("wss2 bar connection works")
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = new URL(request.url, 'ws://base.url');
  console.log(`the pathname = ${pathname}`)
  if (pathname === '/foo') {
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
    });
  } else if (pathname === '/bar') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(9876);