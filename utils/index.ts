/**
 * Team Context Utilities
 */

import { TeamGroup } from "../types";

export const createNewTeam = (
  teamData: Omit<TeamGroup, "id" | "createdAt">
): TeamGroup => {
  return {
    ...teamData,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
};

export const removeTeamById = (
  teams: TeamGroup[],
  teamId: string
): TeamGroup[] => {
  return teams.filter((team) => team.id !== teamId);
};

export const updateTeamById = (
  teams: TeamGroup[],
  teamId: string,
  updates: Partial<TeamGroup>
): TeamGroup[] => {
  return teams.map((team) =>
    team.id === teamId ? { ...team, ...updates } : team
  );
};
