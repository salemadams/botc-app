import { Role } from "@botc/shared";
import rolesData from "../../data/roles/roles.json";

export class RoleService {
  private rolesMap: Map<string, Role>;

  constructor() {
    this.rolesMap = new Map((rolesData as Role[]).map((role) => [role.id, role]));
  }

  /**
   * Get a single role by ID.
   *
   * @param roleId - The role identifier (e.g., "washerwoman")
   * @returns The role object or null if not found
   */
  getRoleById(roleId: string): Role | null {
    return this.rolesMap.get(roleId) ?? null;
  }

  /**
   * Get multiple roles by their IDs.
   * Filters out any IDs that don't match valid roles.
   *
   * @param roleIds - Array of role identifiers
   * @returns Array of role objects (nulls filtered out)
   */
  getRolesByIds(roleIds: string[]): Role[] {
    return roleIds.map((id) => this.getRoleById(id)).filter((role): role is Role => role !== null);
  }

  /**
   * Validate that a role ID exists.
   *
   * @param roleId - The role identifier to check
   * @returns True if role exists, false otherwise
   */
  roleExists(roleId: string): boolean {
    return this.rolesMap.has(roleId);
  }
}
