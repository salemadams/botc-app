import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Script, ScriptListItem, ScriptMeta } from "../../../shared/types/game";
import { RoleService } from "./RoleService";

/**
 * Service for managing Blood on the Clocktower scripts.
 * Handles loading, parsing, and providing script data.
 */
export class ScriptService {
  private scriptsDir: string;
  private roleService: RoleService;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.scriptsDir = path.join(__dirname, "../../data/scripts");
    this.roleService = new RoleService();
  }

  /**
   * Get list of all available scripts (metadata only).
   * Used for UI dropdowns and script selection.
   *
   * @returns Array of script metadata for display
   */
  async getAllScripts(): Promise<ScriptListItem[]> {
    try {
      const files = await fs.readdir(this.scriptsDir);

      const readPromises = files.map(async (file): Promise<ScriptListItem | null> => {
        if (path.extname(file).toLowerCase() === ".json") {
          const scriptId = path.basename(file, ".json");
          const meta = await this.getScriptMeta(scriptId);

          if (meta) {
            return {
              scriptId,
              scriptName: meta.name,
              author: meta.author,
            };
          }
        }
        return null;
      });

      const results = await Promise.all(readPromises);
      return results.filter((r): r is ScriptListItem => r !== null);
    } catch (err) {
      console.error("Error loading scripts:", err);
      return [];
    }
  }

  /**
   * Get full script data by ID (includes metadata and all role IDs).
   * Used when creating a game with a specific script.
   *
   * @param scriptId - The script identifier (filename without .json)
   * @returns Full script array or null if not found
   */
  async getScriptById(scriptId: string): Promise<Script | null> {
    try {
      const filePath = path.join(this.scriptsDir, `${scriptId}.json`);
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as Script;
    } catch (err) {
      console.error(`Error loading script ${scriptId}:`, err);
      return null;
    }
  }

  private async getScriptMeta(scriptId: string): Promise<ScriptMeta | null> {
    const script = await this.getScriptById(scriptId);
    return script ? script[0] : null;
  }

  /**
   * Get array of role IDs for a script (excludes metadata).
   * Used when assigning roles to players.
   *
   * @param scriptId - The script identifier
   * @returns Array of role ID strings
   */
  async getRoleIds(scriptId: string): Promise<string[]> {
    const script = await this.getScriptById(scriptId);
    if (!script) return [];

    return script.slice(1) as string[];
  }

  /**
   * Validate that a script exists.
   * Used by GameService to validate CreateRoom requests.
   *
   * @param scriptId - The script identifier to check
   * @returns True if script exists, false otherwise
   */
  async scriptExists(scriptId: string): Promise<boolean> {
    const script = await this.getScriptById(scriptId);
    return script !== null;
  }
}
