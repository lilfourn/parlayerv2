import axios from 'axios';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { exportAllPlayerStats } from './exportStats';

const RAPID_API_KEY = process.env.RAPID_API_KEY || '498668d019msh8d5c3dfa8440cd6p1a2b07jsn51e2b2f77ade';
const BATCH_SIZE = 20;
const DELAY_BETWEEN_BATCHES = 100;
const CACHE_EXPIRATION_DAYS = 4;

interface PlayerGameStats {
  blk: string;
  OffReb: string;
  ftp: string;
  DefReb: string;
  plusMinus: string;
  stl: string;
  pts: string;
  tech: string;
  team: string;
  TOV: string;
  fga: string;
  ast: string;
  tptfgp: string;
  teamAbv: string;
  mins: string;
  fgm: string;
  fgp: string;
  reb: string;
  teamID: string;
  tptfgm: string;
  fta: string;
  tptfga: string;
  longName: string;
  PF: string;
  playerID: string;
  ftm: string;
  gameID: string;
  fantasyPoints: string;
}

interface PlayerStatsResponse {
  body: {
    [gameId: string]: PlayerGameStats;
  };
}

interface PlayerStatsParams {
  playerID: string;
  season?: string;
  fantasyPoints?: string;
  pts?: string;
  reb?: string;
  stl?: string;
  blk?: string;
  ast?: string;
  TOV?: string;
  mins?: string;
  doubleDouble?: string;
  tripleDouble?: string;
  quadDouble?: string;
}

interface SimplifiedNBAPlayer {
  longName: string;
  team: string;
  playerID: string;
}

type PlayerStatsResult = {
  playerID: string;
  data: PlayerStatsResponse | null;
  error: string | null;
};

async function fetchPlayerList(): Promise<SimplifiedNBAPlayer[]> {
  try {
    const response = await fetch('http://localhost:3000/api/nba/playerStats/playerList');
    if (!response.ok) {
      throw new Error('Failed to fetch player list');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching player list:', error);
    throw error;
  }
}

async function fetchPlayerStats(params: PlayerStatsParams): Promise<PlayerStatsResult> {
  const options = {
    method: 'GET',
    url: 'https://tank01-fantasy-stats.p.rapidapi.com/getNBAGamesForPlayer',
    params: {
      ...params,
      season: params.season || '2025',
      fantasyPoints: params.fantasyPoints || 'true',
      pts: params.pts || '1',
      reb: params.reb || '1.25',
      stl: params.stl || '3',
      blk: params.blk || '3',
      ast: params.ast || '1.5',
      TOV: params.TOV || '-1',
      mins: params.mins || '0',
      doubleDouble: params.doubleDouble || '0',
      tripleDouble: params.tripleDouble || '0',
      quadDouble: params.quadDouble || '0'
    },
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': 'tank01-fantasy-stats.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request<PlayerStatsResponse>(options);
    return { playerID: params.playerID, data: response.data, error: null };
  } catch (error) {
    console.error(`Error fetching stats for player ${params.playerID}:`, error);
    return { playerID: params.playerID, data: null, error: 'Failed to fetch stats' };
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processBatch(playerIDs: string[], params: Omit<PlayerStatsParams, 'playerID'>) {
  const batchPromises = playerIDs.map(playerID => 
    fetchPlayerStats({ ...params, playerID })
  );
  return Promise.all(batchPromises);
}

// Helper function to parse stat values
function parseStatValue(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to check if player stats need updating
async function needsStatsUpdate(playerId: string): Promise<boolean> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { lastUpdated: true }
  });

  if (!player) return true;

  const now = new Date();
  const lastUpdated = player.lastUpdated;
  const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceUpdate >= CACHE_EXPIRATION_DAYS;
}

// Helper function to clear existing game stats for a player
async function clearPlayerGameStats(playerId: string) {
  await prisma.gameStat.deleteMany({
    where: { playerId }
  });
}

// Helper function to store a player's game stats
async function storePlayerGameStats(gameId: string, playerData: PlayerGameStats, playerName: string) {
  try {
    // First, find or create the player
    const player = await prisma.player.upsert({
      where: { id: playerData.playerID },
      create: {
        id: playerData.playerID,
        name: playerName,
        lastUpdated: new Date(),
      },
      update: {
        name: playerName,
        lastUpdated: new Date(),
      },
    });

    // Create the game stat record
    await prisma.gameStat.create({
      data: {
        gameId: gameId,
        date: gameId.split('_')[0],
        team: playerData.teamAbv,
        teamId: playerData.teamID,
        minutes: parseStatValue(playerData.mins),
        points: parseStatValue(playerData.pts),
        rebounds: parseStatValue(playerData.reb),
        offRebounds: parseStatValue(playerData.OffReb),
        defRebounds: parseStatValue(playerData.DefReb),
        assists: parseStatValue(playerData.ast),
        steals: parseStatValue(playerData.stl),
        blocks: parseStatValue(playerData.blk),
        turnovers: parseStatValue(playerData.TOV),
        personalFouls: parseStatValue(playerData.PF.toString()),
        technicals: parseStatValue(playerData.tech),
        
        // Detailed shooting stats
        fgMade: parseStatValue(playerData.fgm),
        fgAttempted: parseStatValue(playerData.fga),
        fgPercentage: parseStatValue(playerData.fgp),
        threePtMade: parseStatValue(playerData.tptfgm),
        threePtAttempted: parseStatValue(playerData.tptfga),
        threePtPercentage: parseStatValue(playerData.tptfgp),
        ftMade: parseStatValue(playerData.ftm),
        ftAttempted: parseStatValue(playerData.fta),
        ftPercentage: parseStatValue(playerData.ftp),
        
        // Combined stats for compatibility
        fg: `${playerData.fgm}/${playerData.fga}`,
        threePt: `${playerData.tptfgm}/${playerData.tptfga}`,
        ft: `${playerData.ftm}/${playerData.fta}`,
        
        plusMinus: playerData.plusMinus,
        fantasyPoints: parseStatValue(playerData.fantasyPoints),
        playerId: player.id,
      },
    });
  } catch (error) {
    console.error(`Error storing stats for player ${playerName}:`, error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specificPlayerIDs = searchParams.get('playerIDs');
    
    let playerIDs: string[];
    
    if (specificPlayerIDs) {
      // If specific player IDs are provided, use them
      playerIDs = specificPlayerIDs.split(',');
    } else {
      // Otherwise, fetch all player IDs
      try {
        const players = await fetchPlayerList();
        playerIDs = players.map(player => player.playerID);
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to fetch player list' },
          { status: 500 }
        );
      }
    }

    // Parse other parameters
    const params: Omit<PlayerStatsParams, 'playerID'> = {
      season: searchParams.get('season') || undefined,
      fantasyPoints: searchParams.get('fantasyPoints') || undefined,
      pts: searchParams.get('pts') || undefined,
      reb: searchParams.get('reb') || undefined,
      stl: searchParams.get('stl') || undefined,
      blk: searchParams.get('blk') || undefined,
      ast: searchParams.get('ast') || undefined,
      TOV: searchParams.get('TOV') || undefined,
      mins: searchParams.get('mins') || undefined,
      doubleDouble: searchParams.get('doubleDouble') || undefined,
      tripleDouble: searchParams.get('tripleDouble') || undefined,
      quadDouble: searchParams.get('quadDouble') || undefined,
    };

    // Process players in batches
    const results = [];
    for (let i = 0; i < playerIDs.length; i += BATCH_SIZE) {
      const batch = playerIDs.slice(i, i + BATCH_SIZE);
      const batchResults = await processBatch(batch, params);
      results.push(...batchResults);
      
      // Add delay between batches if not the last batch
      if (i + BATCH_SIZE < playerIDs.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    // Transform results to the original format
    const transformedResults = results.reduce<Record<string, PlayerStatsResponse | { error: string }>>((acc, { playerID, data, error }) => {
      acc[playerID] = error ? { error } : (data as PlayerStatsResponse);
      return acc;
    }, {});

    // Store in database asynchronously without waiting
    try {
      const formattedForDb: Record<string, { statusCode: number; body: Record<string, PlayerGameStats> }> = {};
      for (const [playerId, result] of Object.entries(transformedResults)) {
        if ('error' in result) continue;
        formattedForDb[playerId] = {
          statusCode: 200,
          body: result.body || {}
        };
      }
      // Don't await this to maintain original response time
      exportAllPlayerStats(formattedForDb).catch(error => {
        console.error('Background database export error:', error);
      });
    } catch (error) {
      console.error('Error preparing data for database:', error);
    }

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('NBA Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const players = await fetchPlayerList();
    let successCount = 0;
    let errorCount = 0;
    let cacheHits = 0;

    for (const player of players) {
      try {
        // Check if we need to update this player's stats
        const shouldUpdate = await needsStatsUpdate(player.playerID);

        if (!shouldUpdate) {
          cacheHits++;
          continue;
        }

        const result = await fetchPlayerStats({ playerID: player.playerID });
        
        if (result.data?.body) {
          // Clear existing stats before storing new ones
          await clearPlayerGameStats(player.playerID);
          
          // Process each game's stats for the player
          for (const [gameId, gameStats] of Object.entries(result.data.body)) {
            await storePlayerGameStats(gameId, gameStats, player.longName);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing player ${player.longName}:`, error);
        errorCount++;
      }

      // Add a small delay between players to avoid rate limiting
      await delay(DELAY_BETWEEN_BATCHES);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${successCount} game stats with ${errorCount} errors. ${cacheHits} players were served from cache.`,
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process player stats' },
      { status: 500 }
    );
  }
}