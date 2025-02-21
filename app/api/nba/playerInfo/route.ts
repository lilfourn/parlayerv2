import { NextResponse } from 'next/server';
import axios from 'axios';
import { headers } from '@/config/api-config';
import { fetchTeamsData } from '../teams/route';
import { Player, PlayerStats } from '@/types/nba';
import { Redis } from '@upstash/redis';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const CACHE_KEY_1 = 'nba_players_data_1';
const CACHE_KEY_2 = 'nba_players_data_2';
const CACHE_TTL = 24 * 60 * 60; // 24 hours
const CHUNK_SIZE = 100; // Number of players per chunk
const CACHE_PREFIX = 'nba_players';
const CACHE_METADATA_KEY = `${CACHE_PREFIX}_metadata`;

interface CacheMetadata {
  totalChunks: number;
  totalPlayers: number;
  lastUpdated: string;
}

// Initialize Redis client
const redis = new Redis({
  url: `https://${process.env.REDIS_URL}`,
  token: process.env.REDIS_TOKEN || '',
});

interface APIPlayerResponse {
  longName?: string;
  stats?: PlayerStats;
  [key: string]: any;
}

// Convert string stats to numbers
function parsePlayerStats(stats: any): PlayerStats | null {
  if (!stats) return null;

  return {
    tech: Number(stats.tech || 0),
    PF: Number(stats.PF || 0),
    usage: Number(stats.usage || 0),
    fantasyPoints: Number(stats.fantasyPoints || 0),
    blk: stats.blk || '0',
    fga: stats.fga || '0',
    DefReb: stats.DefReb || '0',
    ast: stats.ast || '0',
    ftp: stats.ftp || '0',
    tptfgp: stats.tptfgp || '0',
    tptfgm: stats.tptfgm || '0',
    trueShootingPercentage: stats.trueShootingPercentage || '0',
    stl: stats.stl || '0',
    fgm: stats.fgm || '0',
    pts: stats.pts || '0',
    reb: stats.reb || '0',
    fgp: stats.fgp || '0',
    effectiveShootingPercentage: stats.effectiveShootingPercentage || '0',
    fta: stats.fta || '0',
    mins: stats.mins || '0',
    gamesPlayed: stats.gamesPlayed || '0',
    TOV: stats.TOV || '0',
    OffReb: stats.OffReb || '0',
    tptfga: stats.tptfga || '0',
    ftm: stats.ftm || '0'
  };
}

async function getPlayerInfo(playerName: string) {
  const options = {
    method: 'GET',
    url: 'https://tank01-fantasy-stats.p.rapidapi.com/getNBAPlayerInfo',
    params: {
      playerName,
      statsToGet: 'averages'
    },
    headers
  };

  try {
    const response = await axios.request(options);
    const players = response.data.body as APIPlayerResponse[] || [];
    
    return players.map((player: APIPlayerResponse) => {
      if (!player) return null;

      // Split name into first and last name
      const nameParts = player.longName?.split(' ') || [];
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ');

      return {
        playerID: player.playerID,
        teamID: player.teamID || '',
        team: player.team || '',
        pos: player.pos || '',
        jerseyNum: player.jerseyNumber || '',
        longName: player.longName || `${firstName} ${lastName}`,
        shortName: player.shortName || lastName,
        firstSeen: player.firstSeen || '',
        height: player.height || '',
        weight: player.weight || '',
        bDay: player.bDay || '',
        exp: player.exp || '',
        college: player.college || '',
        injury: player.injury || null,
        stats: parsePlayerStats(player.stats),
        nbaComID: player.nbaComID || '',
        nbaComName: player.nbaComName || '',
        nbaComLink: player.nbaComLink || '',
        nbaComHeadshot: player.nbaComHeadshot || '',
        espnID: player.espnID || '',
        espnName: player.espnName || '',
        espnLink: player.espnLink || '',
        espnHeadshot: player.espnHeadshot || '',
        espnShortName: player.espnShortName || '',
        bRefID: player.bRefID || '',
        bRefName: player.bRefName || '',
        yahooPlayerID: player.yahooPlayerID || '',
        yahooLink: player.yahooLink || '',
        cbsPlayerID: player.cbsPlayerID || '',
        fantasyProsPlayerID: player.fantasyProsPlayerID || '',
        fantasyProsLink: player.fantasyProsLink || '',
        rotoWirePlayerID: player.rotoWirePlayerID || '',
        rotoWirePlayerIDFull: player.rotoWirePlayerIDFull || '',
        sleeperBotID: player.sleeperBotID || '',
        lastGamePlayed: player.lastGamePlayed || ''
      } as Player;
    }).filter((player): player is NonNullable<Player> => player !== null);
  } catch (error) {
    console.error(`Error fetching info for player ${playerName}:`, error);
    return [];
  }
}

// Utility function for rate limiting
async function rateLimitedRequest<T>(
  fn: () => Promise<T>,
  requestStartTime: number
): Promise<T> {
  const MIN_REQUEST_TIME = 100; // Minimum time between requests in ms
  const elapsedTime = Date.now() - requestStartTime;
  
  if (elapsedTime < MIN_REQUEST_TIME) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_TIME - elapsedTime));
  }
  
  return fn();
}

// Optimize parallel processing with chunking
async function processInParallel<T>(
  items: string[],
  processor: (item: string) => Promise<T>,
  concurrency: number = 20
): Promise<T[]> {
  const results: T[] = [];
  const chunks = chunk(items, Math.min(concurrency, items.length));
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(item => rateLimitedRequest(() => processor(item), Date.now()))
    );
    results.push(...chunkResults.filter(Boolean));
  }
  
  return results;
}

// Helper function to chunk array
function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

async function compressData(data: any): Promise<Buffer> {
  const jsonStr = JSON.stringify(data);
  return await gzipAsync(Buffer.from(jsonStr));
}

async function decompressData<T>(buffer: Buffer): Promise<T> {
  const decompressed = await gunzipAsync(buffer);
  return JSON.parse(decompressed.toString()) as T;
}

async function storePlayersInChunks(players: Player[]): Promise<void> {
  const totalPlayers = players.length;
  const totalChunks = Math.ceil(totalPlayers / CHUNK_SIZE);

  // Store metadata
  const metadata: CacheMetadata = {
    totalChunks,
    totalPlayers,
    lastUpdated: new Date().toISOString()
  };
  await redis.set(CACHE_METADATA_KEY, JSON.stringify(metadata), { ex: CACHE_TTL });

  // Store chunks in parallel
  const chunkPromises = Array.from({ length: totalChunks }, async (_, index) => {
    const start = index * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    const chunk = players.slice(start, end);
    const compressedChunk = await compressData(chunk);
    return redis.set(`${CACHE_PREFIX}_chunk_${index}`, compressedChunk, { ex: CACHE_TTL });
  });

  await Promise.all(chunkPromises);
}

async function getPlayersFromCache(): Promise<Player[] | null> {
  const metadata = await redis.get<CacheMetadata>(CACHE_METADATA_KEY);
  if (!metadata) return null;

  try {
    const chunkPromises = Array.from(
      { length: metadata.totalChunks },
      async (_, index) => {
        const compressedChunk = await redis.get<Buffer>(`${CACHE_PREFIX}_chunk_${index}`);
        if (!compressedChunk) throw new Error(`Missing chunk ${index}`);
        return decompressData<Player[]>(compressedChunk);
      }
    );

    const chunks = await Promise.all(chunkPromises);
    return chunks.flat();
  } catch (error) {
    console.error('Error retrieving chunks:', error);
    return null;
  }
}

// Add POST endpoint for cache refresh
export async function POST(request: Request) {
  const authHeader = request.headers.get('x-api-key');
  if (authHeader !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Clear existing cache
    await Promise.all([
      redis.del(CACHE_KEY_1),
      redis.del(CACHE_KEY_2)
    ]);

    // Fetch fresh data
    const teams = await fetchTeamsData();
    
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

    // Convert Set to Array
    const uniquePlayerNames = Array.from(playerNames);
    
    // Process all players in parallel with optimized chunking
    const results = await processInParallel(
      uniquePlayerNames,
      getPlayerInfo,
      20
    );

    // Flatten and filter results
    const allPlayers = results.flat().filter((player): player is NonNullable<Player> => player !== null);

    // Store in cache using compression and chunking
    await storePlayersInChunks(allPlayers);

    return NextResponse.json({ 
      success: true,
      message: 'Player cache refreshed successfully',
      totalPlayers: allPlayers.length
    });
  } catch (error) {
    console.error('Error refreshing player cache:', error);
    return NextResponse.json(
      { error: 'Failed to refresh player cache' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Try to get from cache first
    const cachedPlayers = await getPlayersFromCache();
    if (cachedPlayers) {
      return NextResponse.json({ 
        data: cachedPlayers 
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'cache-status': 'HIT'
        }
      });
    }

    // If not in cache, fetch as normal
    const teams = await fetchTeamsData();
    
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

    // Convert Set to Array
    const uniquePlayerNames = Array.from(playerNames);
    
    // Process all players in parallel with optimized chunking
    const results = await processInParallel(
      uniquePlayerNames,
      getPlayerInfo,
      20
    );

    // Flatten and filter results
    const allPlayers = results.flat().filter((player): player is NonNullable<Player> => player !== null);

    // Store in cache using compression and chunking
    await storePlayersInChunks(allPlayers);

    return NextResponse.json({ 
      data: allPlayers 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'cache-status': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error in player info route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player info' },
      { status: 500 }
    );
  }
}