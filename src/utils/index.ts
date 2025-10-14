import { createContext, useContext } from "react";
import { TeamGroup } from "../types";

/**
 * Team Context Definition
 */
export interface TeamContextType {
  teams: TeamGroup[];
  addTeam: (team: Omit<TeamGroup, "id" | "createdAt">) => void;
  deleteTeam: (teamId: string) => void;
}

export const TeamContext = createContext<TeamContextType | undefined>(
  undefined
);

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}

/**
 * Team Utilities
 */
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
