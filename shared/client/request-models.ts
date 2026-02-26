import { Message } from "../game";

export interface CreateRoomRequest {
  name: string;
  scriptId: string;
}

export interface JoinRoomRequest {
  code: string;
  name: string;
}

export interface LeaveRoomRequest {
  code: string;
}

export interface StartGameRequest {
  code: string;
  roleRequirements: { [key: string]: number };
  enabledRoleIds: string[];
}

export interface NotifyPlayerRequest {
  socketId: string;
}

export interface ToggleAliveRequest {
  socketId: string;
  code: string;
}

export interface SendMessageRequest {
  fromSocket: string;
  toSocket: string;
  message: string;
}

export interface ChangeDayRequest {
  code: string
  day: number
}

export interface ToggleNightRequest {
  code: string
}
