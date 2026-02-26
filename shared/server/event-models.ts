import { GameRoom, Message, Player, Role } from "../game";
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

export interface KillToggledEvent {
  socketId: string;
  alive: boolean
}

export interface MessageSentEvent {
  fromSocket: string;
  message: Message;
}

export interface DayChangedEvent {
  day: number
}

export interface NightToggledEvent {
  isNight: boolean
}

export interface TimerChangedEvent {
  time: number
}
