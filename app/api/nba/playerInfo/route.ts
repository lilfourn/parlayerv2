import { NextResponse } from 'next/server';
import axios from 'axios';
import { headers } from '@/config/api-config';
import { fetchTeamsData } from '../teams/route';
import { Player, PlayerStats } from '@/types/nba';

interface APIPlayerResponse {
  longName?: string;
  stats?: PlayerStats;
  [key: string]: any;
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

      // Parse the stats into numbers
      const parsedStats = player.stats ? {
        fga: Number(player.stats.fga || 0),
        ast: Number(player.stats.ast || 0),
        tptfgp: Number(player.stats.tptfgp || 0),
        tptfgm: Number(player.stats.tptfgm || 0),
        fgm: Number(player.stats.fgm || 0),
        reb: Number(player.stats.reb || 0),
        fgp: Number(player.stats.fgp || 0),
        mins: Number(player.stats.mins || 0),
        fta: Number(player.stats.fta || 0),
        tptfga: Number(player.stats.tptfga || 0),
        OffReb: Number(player.stats.OffReb || 0),
        ftm: Number(player.stats.ftm || 0),
        blk: Number(player.stats.blk || 0),
        tech: Number(player.stats.tech || 0),
        DefReb: Number(player.stats.DefReb || 0),
        ftp: Number(player.stats.ftp || 0),
        stl: Number(player.stats.stl || 0),
        pts: Number(player.stats.pts || 0),
        PF: Number(player.stats.PF || 0),
        TOV: Number(player.stats.TOV || 0),
        usage: Number(player.stats.usage || 0),
        fantasyPoints: Number(player.stats.fantasyPoints || 0)
      } : null;

      // Split name into first and last name
      const nameParts = player.longName?.split(' ') || [];
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ');

      return {
        ...player,
        firstName,
        lastName,
        stats: parsedStats
      };
    }).filter(Boolean);
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

// Process requests in parallel with rate limiting
async function processInParallel<T>(
  items: string[],
  processor: (item: string) => Promise<T>,
  concurrency: number = 10
): Promise<T[]> {
  const results: T[] = [];
  let currentIndex = 0;

  async function processNext(): Promise<void> {
    const index = currentIndex++;
    if (index >= items.length) return;

    const requestStartTime = Date.now();
    const result = await rateLimitedRequest(() => processor(items[index]), requestStartTime);
    results[index] = result;

    return processNext();
  }

  // Start processing with concurrency limit
  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
}

export async function GET() {
  try {
    // Get all teams data
    const teams = await fetchTeamsData();
    
    // Extract unique player names from rosters
    const playerNames = new Set<string>();
    teams.forEach(team => {
      if (team.Roster) {
        Object.values(team.Roster).forEach((player: Player) => {
          if (player?.longName) {
            // Extract last name
            const nameParts = player.longName.split(' ');
            const lastName = nameParts[nameParts.length - 1];
            playerNames.add(lastName);
          }
        });
      }
    });

    // Convert Set to Array
    const uniquePlayerNames = Array.from(playerNames);
    
    // Process all players in parallel with rate limiting
    const results = await processInParallel(
      uniquePlayerNames,
      getPlayerInfo,
      10 // Concurrent requests limit
    );

    // Flatten results
    const allPlayers = results.flat();

    return NextResponse.json({
      success: true,
      data: allPlayers,
      totalPlayers: allPlayers.length,
      message: `Successfully fetched data for ${allPlayers.length} players`
    });
  } catch (error) {
    console.error('Error in player info route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player information' },
      { status: 500 }
    );
  }
}