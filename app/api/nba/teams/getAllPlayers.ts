import type { NBATeam, Player } from '@/types/nba';
import { fetchTeamsData } from './route';

export async function getAllNBAPlayerIds(): Promise<string[]> {
  try {
    const teams = await fetchTeamsData();
    const playerIds = new Set<string>();

    teams.forEach(team => {
      if (team.Roster) {
        // The Roster object contains player data directly
        Object.values(team.Roster).forEach((player: Player) => {
          if (player?.playerID) {
            playerIds.add(player.playerID);
          }
        });
      }
    });

    return Array.from(playerIds);
  } catch (error) {
    console.error('Error fetching NBA player IDs:', error);
    throw error;
  }
}
