const express = require('express');
const { Server } = require("socket.io")
const { createServer } = require('http')

const port = 3030;

const app = express(); 
const server = new createServer(app);

const io = new Server(server, {
  cors:{
    origin:"*"
  }
})

io.on("connection", (socket) => {
    console.log("User Connected", socket.id)
    socket.emit("welcome", `Welcome To Server ${socket.id}`)
    socket.on("message", (data) => {
      console.log(data);
    })
})



server.listen(port, () => {
  console.log("App is running")
})