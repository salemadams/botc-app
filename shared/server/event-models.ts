import { GameRoom, Player, Role } from "../game";
export interface RoomCreatedEvent {
  room: GameRoom;
}

export interface RoomJoinedEvent {
  currentPlayer: Player;
  room: GameRoom;
}

export interface PlayerJoinedEvent {
  player: Player;
}

export interface PlayerLeftEvent {
  socketId: string;
}

export interface GameStartedEvent {
  room: GameRoom;
}

export interface RoleAssignedEvent {
  role: Role;
}

export interface JoinRoomErrorEvent {
  message: string;
}
