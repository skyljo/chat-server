// Import the 'ws' library
const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 }); // Replace 8080 with your desired port number
console.log(wss)
// Event handler for new WebSocket connections
wss.on('connection', function connection(ws) {
  console.log('A new client connected');

  // Event handler for incoming messages from clients
  ws.on('message', function incoming(message) {
    console.log('Received: %s', message);

    // Broadcast the message to all connected clients (if needed)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Event handler for client disconnection
  ws.on('close', function close() {
    console.log('A client disconnected');
  });
});
