import { Teams } from "./teams";

export enum ServerPhase {
  lobby,
  playing,
  ended,
}

export interface Player {
  socketId: string;
  name: string;
  host: boolean;
  role?: Role;
  alive: boolean;
}

/**
 * Represents a Blood on the Clocktower character role.
 * This structure matches the official role format from bra1n/townsquare.
 *
 * @property {string} id - Unique lowercase identifier matching script file references (e.g., "washerwoman", "imp")
 * @property {string} name - Display name shown to players with proper capitalization (e.g., "Washerwoman", "Imp")
 * @property {Teams} team - Role alignment: townsfolk, outsider, minion, or demon
 * @property {string} ability - Full text description of what the role does, shown on character sheet
 * @property {number} firstNight - Position in night order on night 1 (0 = doesn't act, higher = later in sequence)
 * @property {string} firstNightReminder - Instructions for Storyteller on what to do for this role on night 1
 * @property {number} otherNight - Position in night order for nights 2+ (0 = doesn't act)
 * @property {string} otherNightReminder - Instructions for Storyteller on what to do for this role on subsequent nights
 * @property {string[]} reminders - Names of reminder tokens the Storyteller can place to track game state
 *                                   (e.g., ["Poisoned"] for Poisoner, ["Master"] for Butler)
 * @property {boolean} setup - Whether this role affects game setup (e.g., Baron adds Outsiders, Drunk replaces Townsfolk)
 * @property {boolean} disabled - Whether the host disabled this role before game start
 */
export interface Role {
  id: string;
  name: string;
  team: Teams;
  ability: string;
  firstNight: number;
  firstNightReminder: string;
  otherNight: number;
  otherNightReminder: string;
  reminders: string[];
  setup: boolean;
  disabled: boolean;
}

/**
 * Metadata object that appears as the first element in a script JSON file.
 * Always has id set to "_meta" to identify it as metadata.
 *
 * @property {string} id - Always "_meta" to distinguish from role IDs
 * @property {string} author - Script creator's name (empty string for official scripts)
 * @property {string} name - Display name of the script (e.g., "Trouble Brewing")
 * @property {string} [logo] - Optional URL or path to script logo image
 */
export interface ScriptMeta {
  id: "_meta";
  author: string;
  name: string;
  logo?: string;
}

/**
 * Represents a Blood on the Clocktower script JSON file.
 * Format: [metadata_object, ...role_ids]
 *
 * The first element is always a ScriptMeta object with id="_meta".
 * Remaining elements are role ID strings that reference roles in roles.json.
 *
 * @example
 * [
 *   { "id": "_meta", "author": "", "name": "Trouble Brewing" },
 *   "washerwoman",
 *   "librarian",
 *   "imp"
 * ]
 */
export type Script = [ScriptMeta, ...string[]];

export interface ScriptDetail {
  meta: ScriptMeta;
  roles: Role[];
}
/**
 * Represents a script in the API response for listing available scripts.
 * Used by the client to display script options in the UI (dropdowns, cards, etc.)
 *
 * @property {string} scriptId - Unique identifier for the script (filename without .json)
 *                                Used when creating a room to specify which script to play
 * @property {string} scriptName - Human-readable display name (e.g., "Trouble Brewing")
 * @property {string} author - Script creator's name (empty string for official scripts)
 */
export interface ScriptListItem {
  scriptId: string;
  scriptName: string;
  author: string;
}

export interface GameRoom {
  code: string;
  players: Player[];
  phase: ServerPhase;
  scriptDetail: ScriptDetail;
  day: number
  timer: number
}

export interface HostReminderInfo {
  socketId: string,
  playerName: string,
  roleName: string,
  firstNight: boolean,
  details: string,
  priority: number,
}

export interface Message {
  message: string;
  fromSelf: boolean;
}
