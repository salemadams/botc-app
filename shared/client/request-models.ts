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

export interface StartTimerRequest {
  code: string
}

export interface PauseTimerRequest {
  code: string
}

export interface ResetTimerRequest {
  code: string
}

export interface ChangeTimerRequest {
  code: string
  time: number
}
