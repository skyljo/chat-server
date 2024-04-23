// const express = require("express");
// const { Server } = require("socket.io");
// const { createServer } = require("http");
// var cors = require('cors');


// const port = 3030;

// const app = express();
// const server = createServer(app);

// app.use(cors())

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// io.on("connection", (socket) => {
//   let status = false;
//   console.log("User Connected", socket.id);
//   socket.emit("welcome", `Welcome To Server ${socket.id}`);
//   socket.emit("VIDEO-STATUS", status);

//   socket.on("CHANGE-VIDEO-STATUS", () => {
//     status = !status;
//     console.log(status);
//     io.emit("VIDEO-STATUS", status); // Emit the updated status to all clients
//   });
// });

// app.get("/api", (req, res)=>{
// 	res.send("Working")
// })

// server.listen(port, () => {
//   console.log("App is running");
// });

// this.

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
var cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors())

const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substring(7);
}

function getFlagStatus(roomId) {
  return rooms[roomId] ? rooms[roomId].isStarted : false;
}

function changeFlagStatus(roomId, newStatus, socketId) {
  if (rooms[roomId] && io.sockets.adapter.rooms.has(roomId)) {
    const members = io.sockets.adapter.rooms.get(roomId);
    if (members.has(socketId)) {
      rooms[roomId].isStarted = newStatus;
      io.to(roomId).emit('flagStatusChanged', newStatus);
    } else {
      console.log(`User ${socketId} is not a member of room ${roomId}`);
    }
  }
}

io.on('connection', (socket) => {
  console.log('New client connected');

  // Join a room specified by the client
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    // If the room doesn't exist, create a new one
    if (!rooms[roomId]) {
      rooms[roomId] = {
        isStarted: false // Initial flag status is false
      };
    }
    // Send the current flag status to the client
    socket.emit('currentFlagStatus', getFlagStatus(roomId));
  });

  // Handle request to get flag status
  socket.on('getFlagStatus', (roomId) => {
    const flagStatus = getFlagStatus(roomId);
    socket.emit('currentFlagStatus', flagStatus);
  });

  // Handle request to change flag status
  socket.on('changeFlagStatus', (roomId, newStatus) => {
    changeFlagStatus(roomId, newStatus, socket.id);
    console.log(newStatus);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Express route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = 3030;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
