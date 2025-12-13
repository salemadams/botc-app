import "dotenv/config";
import express, { json } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import { GameService } from "./services/GameService";
import { SocketEvent } from "../../shared/types/events";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;
const gameService = new GameService(io);

app.use(cors());
app.use(json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Blood on the Clocktower server is running",
  });
});

io.on("connection", (socket) => {
  console.log(`Connection established to socket: ${socket.id}`);

  socket.on(SocketEvent.CreateRoom, ({ name }) => {
    gameService.createRoom(socket, name);
  });

  socket.on(SocketEvent.JoinRoom, ({ code, name }) => {
    gameService.joinRoom(socket, code, name);
  });

  socket.on(SocketEvent.LeaveRoom, ({ code }) => {
    gameService.leaveRoom(socket, code);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
