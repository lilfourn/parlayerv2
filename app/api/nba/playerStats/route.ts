import axios from 'axios';
import { NextResponse } from 'next/server';

const RAPID_API_KEY = process.env.RAPID_API_KEY || '498668d019msh8d5c3dfa8440cd6p1a2b07jsn51e2b2f77ade';
const BATCH_SIZE = 10; 
const DELAY_BETWEEN_BATCHES = 100; 

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
      season: params.season || '2024',
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

    // Transform results to a more efficient format
    const transformedResults = results.reduce<Record<string, PlayerStatsResponse | { error: string }>>((acc, { playerID, data, error }) => {
      acc[playerID] = error ? { error } : (data as PlayerStatsResponse);
      return acc;
    }, {});

    return NextResponse.json(transformedResults);
    
  } catch (error) {
    console.error('NBA Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player stats' },
      { status: 500 }
    );
  }
}