import { Teams } from "@botc/shared";
import { Role } from "@botc/shared";

export function calculateRoleDistribution(players: number) {
  const demons = 1;
  const minions = players < 10 ? 1 : 1 + Math.floor((players - 7) / 3);
  const outsiders = players >= 7 ? (players - 7) % 3 : players - 5;
  const townsfolk = players - demons - minions - outsiders;

  return {
    [Teams.Townsfolk]: townsfolk,
    [Teams.Outsider]: outsiders,
    [Teams.Minion]: minions,
    [Teams.Demon]: demons,
  };
}

export function validateRoleSelection(
  roles: Role[],
  requiredDistribution: { [key: string]: number },
): { valid: boolean; errors: string[] } {
  const enabledByTeam = roles
    .filter((role) => !role.disabled)
    .reduce(
      (acc, role) => {
        acc[role.team] = (acc[role.team] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

  const errors: string[] = [];

  Object.entries(requiredDistribution).forEach(([team, required]) => {
    const available = enabledByTeam[team] || 0;
    if (available < required) {
      errors.push(`Need ${required} ${team}, only ${available} enabled`);
    }
  });

  return { valid: errors.length === 0, errors };
}
