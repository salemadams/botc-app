import {
  ServerPhase,
  type GameRoom,
  type Player,
  type RoomCreatedEvent,
  type RoomJoinedEvent,
  type PlayerJoinedEvent,
  type JoinRoomErrorEvent,
  PlayerLeftEvent,
  GameStartedEvent,
} from "../../../shared/types/game";
import { SocketEvent } from "../../../shared/types/events";
import type { Server, Socket } from "socket.io";
import { ScriptService } from "./ScriptService";
import { RoleService } from "./RoleService";

export class GameService {
  private gameRooms = new Map<string, GameRoom>();
  private io: Server;
  private scriptService: ScriptService;
  private roleService: RoleService;

  constructor(io: Server) {
    this.io = io;
    this.scriptService = new ScriptService();
    this.roleService = new RoleService();
  }

  private generateUniqueGameCode(rooms: Map<string, Set<string>>): string {
    let newGameCode;
    do {
      newGameCode = String(Math.floor(Math.random() * 9000) + 1000);
    } while (rooms.has(newGameCode));
    return newGameCode;
  }

  async createRoom(socket: Socket, name: string, scriptId: string): Promise<void> {
    const allRooms = this.io.of("/").adapter.rooms;
    const gameCode = this.generateUniqueGameCode(allRooms);
    const player: Player = {
      socketId: socket.id,
      name: name,
      host: true,
    };

    socket.join(gameCode);

    const script = await this.scriptService.getScriptById(scriptId);
    if (!script) {
      console.log(`Script with id ${scriptId} not found, room can not be created`);
      return;
    }

    const roleIds = script.slice(1) as string[];
    const roles = this.roleService.getRolesByIds(roleIds);

    const newRoom: GameRoom = {
      code: gameCode,
      players: [player],
      phase: ServerPhase.lobby,
      scriptDetail: {
        meta: script[0],
        roles: roles,
      },
    };
    this.gameRooms.set(gameCode, newRoom);

    const event: RoomCreatedEvent = { room: newRoom };
    socket.emit(SocketEvent.RoomCreated, event);
    console.log(newRoom.scriptDetail.roles);
    console.log(`${name} created room ${gameCode} with script ${scriptId}`);
  }

  joinRoom(socket: Socket, code: string, name: string): void {
    const allRooms = this.io.of("/").adapter.rooms;

    if (!code || code.length === 0) {
      console.log("Room code is required");
      return;
    }

    if (!allRooms.has(code)) {
      console.log(`Room ${code} not found`);
      const errorEvent: JoinRoomErrorEvent = { message: "Room not found" };
      socket.emit(SocketEvent.JoinRoomError, errorEvent);
      return;
    }

    const player: Player = {
      socketId: socket.id,
      name: name,
      host: false,
    };

    socket.join(code);

    const room = this.gameRooms.get(code);
    if (room) {
      room.players.push(player);

      const roomJoinedEvent: RoomJoinedEvent = { room, currentPlayer: player };
      socket.emit(SocketEvent.RoomJoined, roomJoinedEvent);

      const playerJoinedEvent: PlayerJoinedEvent = { player };
      socket.broadcast.to(code).emit(SocketEvent.PlayerJoined, playerJoinedEvent);

      console.log(`${name} joined room ${code}`);
    }
  }

  leaveRoom(socket: Socket, code: string): void {
    const room = this.gameRooms.get(code);
    // add room doesnt exist error / event
    if (!room) return;
    const isHost = room.players.find((p) => p.socketId === socket.id)?.host;
    if (isHost) {
      this.io.to(code).emit(SocketEvent.RoomLeft);
      this.io.in(code).socketsLeave(code);
      this.gameRooms.delete(code);
      console.log(`Host has closed room ${code}`);
      return;
    }
    room.players = room.players.filter((p) => p.socketId !== socket.id);
    socket.leave(code);
    const playerLeftEvent: PlayerLeftEvent = { socketId: socket.id };
    socket.broadcast.to(code).emit(SocketEvent.PlayerLeft, playerLeftEvent);
    console.log(`Socket ${socket.id} left room ${code}`);
  }

  startGame(socketId: string, code: string) {
    const room = this.gameRooms.get(code);
    if (!room) return;

    const host = room.players.find((p) => p.host);
    if (!host || host.socketId !== socketId) {
      console.log(`Unauthorized start game attempt by ${socketId}`);
      return;
    }

    room.phase = ServerPhase.playing;

    const gameStartedEvent: GameStartedEvent = { room };
    this.io.in(code).emit(SocketEvent.GameStarted, gameStartedEvent);
    console.log(`Game started for room ${code}`);
  }
}
