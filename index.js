const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
var cors = require('cors');


const port = 3030;

const app = express();
const server = createServer(app);

app.use(cors())

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  let status = false;
  console.log("User Connected", socket.id);
  socket.emit("welcome", `Welcome To Server ${socket.id}`);
  socket.emit("VIDEO-STATUS", status);

  socket.on("CHANGE-VIDEO-STATUS", () => {
    status = !status;
    console.log(status);
    io.emit("VIDEO-STATUS", status); // Emit the updated status to all clients
  });
});

app.get("/api", (req, res)=>{
	res.send("Working")
})

server.listen(port, () => {
  console.log("App is running");
});
