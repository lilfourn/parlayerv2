import { NextResponse } from 'next/server';
import axios from 'axios';
import type { BoxScoreResponse } from '@/types/nba';
import { fetchTeamsData, extractGameIds } from '../teams/route';

const RAPID_API_KEY = '498668d019msh8d5c3dfa8440cd6p1a2b07jsn51e2b2f77ade';
const RAPID_API_HOST = 'tank01-fantasy-stats.p.rapidapi.com';
const BASE_URL = 'https://tank01-fantasy-stats.p.rapidapi.com/getNBABoxScore';

// Fantasy points scoring settings
const FANTASY_SETTINGS = {
  fantasyPoints: 'true',
  pts: '1',
  stl: '3',
  blk: '3',
  reb: '1.25',
  ast: '1.5',
  TOV: '-1',
  mins: '0',
  doubleDouble: '0',
  tripleDouble: '0',
  quadDouble: '0'
};

async function fetchBoxScore(gameId: string) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        gameID: gameId,
        ...FANTASY_SETTINGS
      },
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST
      }
    });

    if (!response.data.body) {
      throw new Error(`Invalid response format for game ID: ${gameId}`);
    }

    return response.data.body;
  } catch (error) {
    console.error(`Error fetching box score for game ${gameId}:`, error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // Get gameIds from URL parameters or fetch all if not provided
    const { searchParams } = new URL(request.url);
    let gameIds = searchParams.get('gameIds')?.split(',');

    // If no specific gameIds provided, fetch all from teams data
    if (!gameIds || gameIds.length === 0) {
      const teams = await fetchTeamsData();
      gameIds = extractGameIds(teams);
    }

    if (gameIds.length === 0) {
      return NextResponse.json(
        { error: 'No games available' },
        { status: 404 }
      );
    }

    // Fetch box scores for all games concurrently
    const boxScorePromises = gameIds.map(gameId => fetchBoxScore(gameId));
    const boxScores = await Promise.allSettled(boxScorePromises);

    // Process results
    const results: Record<string, any> = {};
    boxScores.forEach((result, index) => {
      const gameId = gameIds[index];
      if (result.status === 'fulfilled') {
        results[gameId] = result.value;
      } else {
        results[gameId] = { error: 'Failed to fetch box score' };
      }
    });

    return NextResponse.json(
      { body: results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching box scores:', error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: `Failed to fetch box scores: ${error.message}` },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
