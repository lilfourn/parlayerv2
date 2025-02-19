import axios from 'axios';
import { fetchTeamsData } from './route';
import { Player } from '@/types/nba';

interface CachedPlayerData {
  timestamp: number;
  players: {
    firstName: string;
    lastName: string;
    team: string;
    id: string;
  }[];
}

let playerCache: CachedPlayerData | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function getAllNBAPlayerNames(forceRefresh = false) {
  // Return cached data if available and not expired
  if (
    !forceRefresh && 
    playerCache && 
    Date.now() - playerCache.timestamp < CACHE_DURATION
  ) {
    return playerCache.players;
  }

  try {
    // Fetch all teams data in one request
    const teams = await fetchTeamsData();
    
    // Extract and process player data from all teams
    const allPlayers = teams.flatMap(team => {
      if (!team.Roster || typeof team.Roster !== 'object') return [];
      
      return Object.values(team.Roster as Record<string, Player>).map(player => {
        const nameParts = player.longName?.split(' ') || [];
        const lastName = nameParts.pop() || '';
        const firstName = nameParts.join(' ');
        
        return {
          firstName,
          lastName,
          team: team.teamAbv,
          id: player.playerID || ''
        };
      });
    });

    // Update cache
    playerCache = {
      timestamp: Date.now(),
      players: allPlayers
    };

    return allPlayers;
  } catch (error) {
    console.error('Error fetching NBA player names:', error);
    
    // Return stale cache if available
    if (playerCache) {
      console.log('Returning stale player cache as fallback');
      return playerCache.players;
    }
    
    throw error;
  }
}

export async function getAllNBAPlayerLastNames() {
  const players = await getAllNBAPlayerNames();
  const lastNamesSet = new Set(players.map(player => player.lastName));
  return Array.from(lastNamesSet);
}

export async function refreshPlayerCache() {
  return getAllNBAPlayerNames(true);
}

// Helper function to get players by team
export function getPlayersByTeam(teamAbv: string) {
  if (!playerCache) {
    throw new Error('Player cache not initialized');
  }
  return playerCache.players.filter(player => player.team === teamAbv);
}

// Helper function to search players by name
export function searchPlayers(query: string) {
  if (!playerCache) {
    throw new Error('Player cache not initialized');
  }
  
  const lowercaseQuery = query.toLowerCase();
  return playerCache.players.filter(player => 
    player.firstName.toLowerCase().includes(lowercaseQuery) ||
    player.lastName.toLowerCase().includes(lowercaseQuery)
  );
}
