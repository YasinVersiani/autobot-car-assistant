// Entry point: serves the React build and opens the Socket.IO channel the chat runs over.

require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const { handleSocketEvents } = require("./socketHandler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const BUILD_DIR = path.join(__dirname, "..", "frontend", "build");

app.use(express.json());
app.use(express.static(BUILD_DIR));

// Single-page app: every other route returns index.html.
app.get("*", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(BUILD_DIR, "index.html"));
});

io.on("connection", (socket) => {
  console.log("user connected " + socket.id);
  handleSocketEvents(socket, io);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
