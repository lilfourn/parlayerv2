import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { headers } from '@/config/api-config';
import axios from 'axios';
import { NBATeam, Player } from '@/types/nba';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const TEAMS_CACHE_KEY = 'nba_teams_data';
const PLAYERS_CACHE_KEY = 'nba_players_data';
const CACHE_TTL = 24 * 60 * 60; // 24 hours

// Initialize Redis client
const redis = new Redis({
  url: `https://${process.env.REDIS_URL}`,
  token: process.env.REDIS_TOKEN || '',
});

async function validateInternalRequest(request: Request) {
  const authHeader = request.headers.get('x-api-key');
  return authHeader === INTERNAL_API_KEY;
}

async function fetchFromAPI<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  const response = await axios.get(`https://tank01-fantasy-stats.p.rapidapi.com/${endpoint}`, {
    params,
    headers
  });

  if (!response.data.body) {
    throw new Error('Invalid response format from API');
  }

  return response.data.body as T;
}

async function refreshTeamsCache(): Promise<void> {
  try {
    // Fetch fresh teams data
    const teams = await fetchFromAPI<NBATeam[]>('getNBATeams', {
      schedules: 'true',
      rosters: 'true',
      statsToGet: 'averages',
      topPerformers: 'true',
      teamStats: 'true'
    });

    // Store in Redis with TTL
    await redis.set(TEAMS_CACHE_KEY, teams, { ex: CACHE_TTL });
    
    console.log('Teams cache refreshed successfully');
  } catch (error) {
    console.error('Error refreshing teams cache:', error);
    throw error;
  }
}

async function refreshPlayersCache(teams: NBATeam[]): Promise<void> {
  try {
    // Extract unique player names from rosters
    const playerNames = new Set<string>();
    teams.forEach(team => {
      if (team.Roster) {
        Object.values(team.Roster).forEach((player: Player) => {
          if (player?.longName) {
            const nameParts = player.longName.split(' ');
            const lastName = nameParts[nameParts.length - 1];
            playerNames.add(lastName);
          }
        });
      }
    });

    // Fetch player data in chunks
    const chunkSize = 20;
    const chunks = Array.from({ length: Math.ceil(playerNames.size / chunkSize) }, (_, i) =>
      Array.from(playerNames).slice(i * chunkSize, (i + 1) * chunkSize)
    );

    const allPlayers: Player[] = [];

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (playerName) => {
        try {
          const players = await fetchFromAPI<Player[]>('getNBAPlayerInfo', {
            playerName,
            statsToGet: 'averages'
          });
          return players;
        } catch (error) {
          console.error(`Error fetching player ${playerName}:`, error);
          return [];
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      allPlayers.push(...chunkResults.flat());

      // Add a small delay between chunks to avoid rate limits
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Store in Redis with TTL
    await redis.set(PLAYERS_CACHE_KEY, allPlayers, { ex: CACHE_TTL });
    
    console.log('Players cache refreshed successfully');
  } catch (error) {
    console.error('Error refreshing players cache:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  if (!await validateInternalRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Refresh teams cache first
    await refreshTeamsCache();
    
    // Get the fresh teams data for player refresh
    const teams = await redis.get<NBATeam[]>(TEAMS_CACHE_KEY);
    if (!teams) throw new Error('Failed to get teams data after refresh');
    
    // Refresh players cache using the fresh teams data
    await refreshPlayersCache(teams);

    return NextResponse.json({
      success: true,
      message: 'NBA data cache refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cache refresh:', error);
    return NextResponse.json(
      { error: 'Failed to refresh NBA data cache' },
      { status: 500 }
    );
  }
}

// GET endpoint to check cache status
export async function GET(request: Request) {
  if (!await validateInternalRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [teams, players] = await Promise.all([
      redis.get<NBATeam[]>(TEAMS_CACHE_KEY),
      redis.get<Player[]>(PLAYERS_CACHE_KEY)
    ]);

    return NextResponse.json({
      teamsCache: {
        exists: !!teams,
        count: teams?.length || 0
      },
      playersCache: {
        exists: !!players,
        count: players?.length || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking cache status:', error);
    return NextResponse.json(
      { error: 'Failed to check cache status' },
      { status: 500 }
    );
  }
}
