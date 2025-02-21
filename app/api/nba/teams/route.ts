import { NextResponse } from 'next/server';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import type { NBATeam, GameSchedule, TeamSchedule, BoxScoreResponse } from '@/types/nba';
import { Redis } from '@upstash/redis';
import { headers } from '@/config/api-config';

const prisma = new PrismaClient();

interface CacheConfig {
  readonly key: string;
  readonly ttl: number;
}

interface CacheKeys {
  readonly TEAMS: CacheConfig;
  readonly BOX_SCORE: (gameId: string) => CacheConfig;
  readonly UPCOMING_GAMES: CacheConfig;
}

const CACHE_KEYS: CacheKeys = {
  TEAMS: {
    key: 'nba_teams_data',
    ttl: 5 * 60 // 5 minutes
  },
  BOX_SCORE: (gameId: string) => ({
    key: `nba_box_score_${gameId}`,
    ttl: 2 * 60 // 2 minutes
  }),
  UPCOMING_GAMES: {
    key: 'nba_upcoming_games',
    ttl: 5 * 60 // 5 minutes
  }
} as const;

// Initialize Redis client
const redis = new Redis({
  url: `https://${process.env.REDIS_URL}`,
  token: process.env.REDIS_TOKEN || '',
});

interface FetchTeamsOptions {
  includeSchedules?: boolean;
  includeRosters?: boolean;
  includeStats?: boolean;
  includeTopPerformers?: boolean;
}

async function fetchFromAPI<T>(endpoint: string, params: Record<string, string | boolean>): Promise<T> {
  const response = await axios.get(`https://tank01-fantasy-stats.p.rapidapi.com/${endpoint}`, {
    params,
    headers
  });

  if (!response.data.body) 
    throw new Error('Invalid response format from API');

  return response.data.body as T;
}

async function fetchTeamsFromAPI(options: FetchTeamsOptions = {}): Promise<NBATeam[]> {
  const params = {
    schedules: String(options.includeSchedules ?? true),
    rosters: String(options.includeRosters ?? true),
    statsToGet: 'averages',
    topPerformers: String(options.includeTopPerformers ?? true),
    teamStats: String(options.includeStats ?? true)
  };

  return fetchFromAPI<NBATeam[]>('getNBATeams', params);
}

async function fetchBoxScore(gameId: string): Promise<BoxScoreResponse | null> {
  const cacheConfig = CACHE_KEYS.BOX_SCORE(gameId);
  
  try {
    // Check cache first
    const cachedBoxScore = await redis.get<BoxScoreResponse>(cacheConfig.key);
    if (cachedBoxScore) return cachedBoxScore;

    // If not in cache, fetch from API
    const boxScore = await fetchFromAPI<BoxScoreResponse>('getNBABoxScore', { gameId });
    
    if (!boxScore) return null;

    // Cache the box score
    await redis.set(cacheConfig.key, boxScore, { ex: cacheConfig.ttl });

    return boxScore;
  } catch (error) {
    console.error(`Error fetching box score for game ${gameId}:`, error);
    return null;
  }
}

function extractGameIds(teams: NBATeam[]): string[] {
  const gameIds = new Set<string>();
  
  teams.forEach(team => {
    if (!team.teamSchedule) return;
    
    Object.values(team.teamSchedule)
      .filter(game => game.gameID)
      .forEach(game => gameIds.add(game.gameID!));
  });

  return Array.from(gameIds);
}

async function cacheBoxScores(gameIds: string[]): Promise<void> {
  const chunkSize = 5;
  const chunks = Array.from({ length: Math.ceil(gameIds.length / chunkSize) }, (_, i) =>
    gameIds.slice(i * chunkSize, i * chunkSize + chunkSize)
  );

  for (const chunk of chunks) {
    await Promise.all(chunk.map(fetchBoxScore));
    if (chunks.indexOf(chunk) < chunks.length - 1)
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between chunks
  }
}

// Helper function to chunk array
function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

// Cache teams data in chunks
async function cacheTeamsData(teams: NBATeam[]): Promise<void> {
  const CHUNK_SIZE = 15; // Split into chunks of 15 teams
  const chunks = chunk(teams, CHUNK_SIZE);
  
  await Promise.all(chunks.map(async (teamChunk, index) => {
    const chunkKey = `${CACHE_KEYS.TEAMS.key}_${index}`;
    await redis.set(chunkKey, teamChunk, {
      ex: CACHE_KEYS.TEAMS.ttl
    });
  }));
  
  // Store the number of chunks for retrieval
  await redis.set(`${CACHE_KEYS.TEAMS.key}_chunks`, chunks.length, {
    ex: CACHE_KEYS.TEAMS.ttl
  });
}

// Retrieve teams data from cache chunks
async function getTeamsFromCache(): Promise<NBATeam[] | null> {
  const numChunks = await redis.get<number>(`${CACHE_KEYS.TEAMS.key}_chunks`);
  if (!numChunks) return null;

  const chunks = await Promise.all(
    Array.from({ length: numChunks }, (_, i) =>
      redis.get<NBATeam[]>(`${CACHE_KEYS.TEAMS.key}_${i}`)
    )
  );

  // If any chunk is missing, return null
  if (chunks.some(chunk => !chunk)) return null;
  
  // Filter out any null values and flatten the array
  return chunks.filter((chunk): chunk is NBATeam[] => chunk !== null).flat();
}

export async function fetchTeamsData(): Promise<NBATeam[]> {
  try {
    // Try to get from Redis cache first
    const cachedTeams = await getTeamsFromCache();
    if (cachedTeams) return cachedTeams;

    // If not in cache, fetch from API
    const teams = await fetchTeamsFromAPI();

    // Cache the teams data in chunks
    await cacheTeamsData(teams);

    // Extract and cache box scores for recent games
    const gameIds = extractGameIds(teams);
    await cacheBoxScores(gameIds);

    return teams;
  } catch (error) {
    console.error('Error fetching NBA teams:', error);
    throw error;
  }
}

async function storeTeamsData(teams: NBATeam[]): Promise<void> {
  try {
    await Promise.all(teams.map(async (team) => {
      await prisma.team.upsert({
        where: { id: team.teamID },
        create: {
          id: team.teamID,
          name: team.teamName,
          abbreviation: team.teamAbv,
          city: team.teamCity,
          conference: team.conference,
          division: team.division,
        },
        update: {
          name: team.teamName,
          abbreviation: team.teamAbv,
          city: team.teamCity,
          conference: team.conference,
          division: team.division,
          lastUpdated: new Date(),
        },
      });
    }));
  } catch (error) {
    console.error('Error storing teams data:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const teams = await fetchTeamsData();
    
    return NextResponse.json({
      body: teams,
      totalTeams: teams.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error in teams route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team information' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Clear all team-related caches
    const numChunks = await redis.get<number>(`${CACHE_KEYS.TEAMS.key}_chunks`) || 0;
    
    // Clear all chunk caches
    await Promise.all([
      ...Array.from({ length: numChunks }, (_, i) => 
        redis.del(`${CACHE_KEYS.TEAMS.key}_${i}`)
      ),
      redis.del(`${CACHE_KEYS.TEAMS.key}_chunks`),
      redis.del(CACHE_KEYS.UPCOMING_GAMES.key)
    ]);
    
    // Fetch fresh data and update caches
    const teams = await fetchTeamsData();
    
    // Clear box score caches
    const gameIds = extractGameIds(teams);
    await Promise.all(
      gameIds.map(gameId => redis.del(CACHE_KEYS.BOX_SCORE(gameId).key))
    );

    // Store fresh data in database
    await storeTeamsData(teams);

    return NextResponse.json({ 
      body: teams,
      totalTeams: teams.length,
      message: 'Teams data updated successfully'
    });
  } catch (error) {
    console.error('Error updating teams data:', error);
    return NextResponse.json(
      { error: 'Failed to update teams data' }, 
      { status: 500 }
    );
  }
}
