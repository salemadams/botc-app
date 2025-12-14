export enum ServerPhase {
  lobby,
  playing,
  ended,
}

export interface Player {
  socketId: string;
  name: string;
  host: boolean;
}

export interface GameRoom {
  code: string;
  players: Player[];
  phase: ServerPhase;
}

export interface CreateRoomRequest {
  name: string;
}

export interface JoinRoomRequest {
  code: string;
  name: string;
}

export interface LeaveRoomRequest {
  code: string;
}

export interface RoomCreatedEvent {
  room: GameRoom;
}

export interface RoomJoinedEvent {
  room: GameRoom;
}

export interface PlayerJoinedEvent {
  player: Player;
}

export interface PlayerLeftEvent {
  socketId: string;
}

export interface JoinRoomErrorEvent {
  message: string;
}
