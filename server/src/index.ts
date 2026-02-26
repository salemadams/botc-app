import "dotenv/config";
import express, { json } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import { GameService } from "./services/GameService";
import { RequestEnum, EventEnum, MessageSentEvent } from "@botc/shared";
import scriptRoutes from "./resources/script/script.routes";

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
const gameService = new GameService(io);

app.use(cors());
app.use(json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "BOTC API is running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Blood on the Clocktower server is running",
  });
});

app.use("/api/script", scriptRoutes);

io.on("connection", (socket) => {
  console.log(`Connection established to socket: ${socket.id}`);

  socket.on(RequestEnum.CreateRoom, ({ name, scriptId }) => {
    gameService.createRoom(socket, name, scriptId);
  });

  socket.on(RequestEnum.JoinRoom, ({ code, name }) => {
    gameService.joinRoom(socket, code, name);
  });

  socket.on(RequestEnum.LeaveRoom, ({ code }) => {
    gameService.leaveRoom(socket, code);
  });

  socket.on(
    RequestEnum.StartGame,
    ({ code, roleRequirements, enabledRoleIds }) => {
      gameService.startGame(socket.id, code, roleRequirements, enabledRoleIds);
    },
  );

  socket.on(RequestEnum.NotifyPlayer, ({ socketId }) =>
    io.to(socketId).emit(EventEnum.PlayerNotified),
  );

  socket.on(RequestEnum.ToggleAlive, ({ socketId, code }) => {
    gameService.toggleAlive(socketId, code);
  });

  socket.on(RequestEnum.SendMessage, ({ fromSocket, toSocket, message }) => {
    const messageSent: MessageSentEvent = { fromSocket, message: { message, fromSelf: false } };
    socket.to(toSocket).emit(EventEnum.MessageSent, messageSent)
  });

  socket.on(RequestEnum.ChangeDay, ({ code, day }) => {
    gameService.changeDay(code, day)
  })

  socket.on(RequestEnum.ToggleNight, ({ code }) => {
    gameService.toggleNight(code)
  })
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
