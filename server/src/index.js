import "dotenv/config";
import express, { json } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Blood on the Clocktower server is running",
  });
});

io.on("connection", (socket) => {
  console.log(`Connection established to socket: ${socket}`);

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  });
  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
    console.log(`Socket ${socket.id} left room: ${roomName}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
