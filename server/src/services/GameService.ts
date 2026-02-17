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
  Role,
  RoleAssignedEvent,
  EventEnum,
  KillToggledEvent,
  DayChangedEvent,
} from "@botc/shared";
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

  changeDay(code: string, day: number) {
    if (isNaN(day) || day < 1) {
      console.log(`Invalid day value ${day}. The day was not changed.`)
      return
    }
    const room = this.gameRooms.get(code)
    if (!room) {
      console.log(`Room with code ${code} not found. The day was not changed.`)
      return
    }
    room.day = day
    const dayChangedEvent: DayChangedEvent = { day }
    this.io.to(code).emit(EventEnum.DayChanged, dayChangedEvent)
  }

  toggleAlive(socketId: string, code: string): void {
    const room = this.gameRooms.get(code)
    if (!room) {
      console.log(`Room with code ${code} not found. Player with socket ID ${socketId} was not modified`)
      return
    }
    const player = room.players.find((p) => p.socketId === socketId)
    if (!player) {
      console.log(`Player with socket ID ${socketId} was not found`)
      return
    }
    player.alive = !player.alive
    const killToggledEvent: KillToggledEvent = { socketId: player.socketId, alive: player.alive };
    this.io.to(code).emit(EventEnum.KillToggled, killToggledEvent);
  }

  async createRoom(
    socket: Socket,
    name: string,
    scriptId: string,
  ): Promise<void> {
    const allRooms = this.io.of("/").adapter.rooms;
    const gameCode = this.generateUniqueGameCode(allRooms);
    const player: Player = {
      socketId: socket.id,
      name: name,
      host: true,
      alive: true,
    };

    socket.join(gameCode);

    const script = await this.scriptService.getScriptById(scriptId);
    if (!script) {
      console.log(
        `Script with id ${scriptId} not found, room can not be created`,
      );
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
      day: 1
    };
    this.gameRooms.set(gameCode, newRoom);

    const event: RoomCreatedEvent = { room: newRoom };
    socket.emit(EventEnum.RoomCreated, event);
    console.log(`${name} created room ${gameCode} with script ${scriptId}`);

    // Auto-add test players in development mode
    if (process.env.NODE_ENV === "development") {
      this.addTestPlayers(gameCode, 5);
    }
  }

  private addTestPlayers(gameCode: string, count: number): void {
    const room = this.gameRooms.get(gameCode);
    if (!room) return;

    const testPlayerNames = [
      "Alice",
      "Bob",
      "Charlie",
      "Diana",
      "Eve",
      "Frank",
      "Grace",
      "Henry",
    ];

    for (let i = 0; i < count; i++) {
      const fakePlayer: Player = {
        socketId: `bot-${gameCode}-${i}`,
        name: testPlayerNames[i] || `Bot ${i + 1}`,
        host: false,
        alive: true,
      };

      room.players.push(fakePlayer);

      const playerJoinedEvent: PlayerJoinedEvent = { player: fakePlayer };
      this.io.to(gameCode).emit(EventEnum.PlayerJoined, playerJoinedEvent);
    }

    console.log(`Added ${count} test players to room ${gameCode}`);
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
      socket.emit(EventEnum.JoinRoomError, errorEvent);
      return;
    }

    const player: Player = {
      socketId: socket.id,
      name: name,
      host: false,
      alive: true,
    };

    socket.join(code);

    const room = this.gameRooms.get(code);
    if (room) {
      room.players.push(player);

      const roomJoinedEvent: RoomJoinedEvent = { room, currentPlayer: player };
      socket.emit(EventEnum.RoomJoined, roomJoinedEvent);

      const playerJoinedEvent: PlayerJoinedEvent = { player };
      socket.broadcast.to(code).emit(EventEnum.PlayerJoined, playerJoinedEvent);

      console.log(`${name} joined room ${code}`);
    }
  }

  leaveRoom(socket: Socket, code: string): void {
    const room = this.gameRooms.get(code);
    // add room doesnt exist error / event
    if (!room) return;
    const isHost = room.players.find((p) => p.socketId === socket.id)?.host;
    if (isHost) {
      this.io.to(code).emit(EventEnum.RoomLeft);
      this.io.in(code).socketsLeave(code);
      this.gameRooms.delete(code);
      console.log(`Host has closed room ${code}`);
      return;
    }
    room.players = room.players.filter((p) => p.socketId !== socket.id);
    socket.leave(code);
    const playerLeftEvent: PlayerLeftEvent = { socketId: socket.id };
    socket.broadcast.to(code).emit(EventEnum.PlayerLeft, playerLeftEvent);
    console.log(`Socket ${socket.id} left room ${code}`);
  }

  startGame(
    socketId: string,
    code: string,
    roleRequirements: { [key: string]: number },
    enabledRoleIds: string[],
  ) {
    const room = this.gameRooms.get(code);
    if (!room) return;

    const host = room.players.find((p) => p.host);
    if (!host || host.socketId !== socketId) {
      console.log(`Unauthorized start game attempt by ${socketId}`);
      return;
    }

    const enabledRoles = this.roleService.getRolesByIds(enabledRoleIds);
    const nonHostPlayers = room.players.filter((p) => !p.host);

    const rolePool: Role[] = [];
    Object.entries(roleRequirements).forEach(([team, count]) => {
      const teamRoles = enabledRoles.filter((r) => r.team === team);
      const selected = teamRoles
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
      rolePool.push(...selected);
    });

    const shuffledRoles = rolePool.sort(() => Math.random() - 0.5);
    nonHostPlayers.forEach((player, index) => {
      player.role = shuffledRoles[index];
    });

    room.phase = ServerPhase.playing;

    const gameStartedEvent: GameStartedEvent = { room };
    this.io.in(code).emit(EventEnum.GameStarted, gameStartedEvent);
    room.players.map((p) => {
      if (p.host) return;
      const roleAssignedEvent: RoleAssignedEvent = { role: p.role! };
      this.io.to(p.socketId).emit(EventEnum.RoleAssigned, roleAssignedEvent);
    });
    console.log(`Game started for room ${code}`);
  }
}
