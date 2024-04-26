const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

function getIsNextStatus(roomId) {
  return rooms[roomId] ? rooms[roomId].isNext : false;
}

function changeIsNextStatus(roomId, newStatus, socketId) {
  if (rooms[roomId] && io.sockets.adapter.rooms.has(roomId)) {
    const members = io.sockets.adapter.rooms.get(roomId);
    if (members.has(socketId)) {
      rooms[roomId].isNext = newStatus;
      io.to(roomId).emit('isNextStatusChanged', newStatus);
    } else {
      console.log(`User ${socketId} is not a member of room ${roomId}`);
    }
  }
}

// Function to get the URL for a room
function getRoomUrl(roomId) {
  return rooms[roomId] ? rooms[roomId].url : null;
}

// Function to change the URL for a room
function changeRoomUrl(roomId, newUrl) {
  if (rooms[roomId]) {
    rooms[roomId].url = newUrl;
    io.to(roomId).emit('urlChanged', newUrl);
  }
}

// Function to get the upload status for a room
function getUploadStatus(roomId) {
  return rooms[roomId] ? rooms[roomId].isUploaded : false;
}

// Function to change the upload status for a room
function changeUploadStatus(roomId, newStatus, socketId) {
  if (rooms[roomId] && io.sockets.adapter.rooms.has(roomId)) {
    const members = io.sockets.adapter.rooms.get(roomId);
    if (members.has(socketId)) {
      rooms[roomId].isUploaded = newStatus;
      io.to(roomId).emit('uploadStatusChanged', newStatus);
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
        isStarted: false,
        isNext: false, // New flag: isNext
        url: '',       // Initial URL is empty
        isUploaded: false // Initial upload status is false
      };
    }
    // Send the current flag status, isNext status, URL, and upload status to the client
    socket.emit('currentFlagStatus', getFlagStatus(roomId));
    socket.emit('currentIsNextStatus', getIsNextStatus(roomId));
    socket.emit('currentUrl', getRoomUrl(roomId));
    socket.emit('currentUploadStatus', getUploadStatus(roomId));
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

  // Handle request to get isNext status
  socket.on('getIsNextStatus', (roomId) => {
    const isNextStatus = getIsNextStatus(roomId);
    confirm.log(isNextStatus,"IS NEXT");
    socket.emit('currentIsNextStatus', isNextStatus);
  });

  // Handle request to change isNext status
  socket.on('changeIsNextStatus', (roomId, newStatus) => {
    changeIsNextStatus(roomId, newStatus, socket.id);
    console.log(newStatus,"---->");
  });

  // Handle request to get URL
  socket.on('getUrl', (roomId) => {
    const url = getRoomUrl(roomId);
    socket.emit('currentUrl', url);
  });

  // Handle request to change URL
  socket.on('changeUrl', (roomId, newUrl) => {
    changeRoomUrl(roomId, newUrl);
    console.log(newUrl);
  });

  // Handle request to get upload status
  socket.on('getUploadStatus', (roomId) => {
    const uploadStatus = getUploadStatus(roomId);
    socket.emit('currentUploadStatus', uploadStatus);
  });

  // Handle request to change upload status
  socket.on('changeUploadStatus', (roomId, newStatus) => {
    changeUploadStatus(roomId, newStatus, socket.id);
    console.log(newStatus);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Express route to serve index.html
app.get('/', (req, res) => {
  res.send("Working")
});

const PORT = 3030;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
