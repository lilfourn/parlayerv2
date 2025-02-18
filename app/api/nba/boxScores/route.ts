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

async function fetchMultipleBoxScores(gameIds: string[]) {
  const results: Record<string, BoxScoreResponse['body']> = {};
  const errors: Record<string, string> = {};

  // Use Promise.allSettled to handle multiple requests concurrently
  const promises = gameIds.map(gameId => fetchBoxScore(gameId));
  const outcomes = await Promise.allSettled(promises);

  outcomes.forEach((outcome, index) => {
    const gameId = gameIds[index];
    if (outcome.status === 'fulfilled') {
      results[gameId] = outcome.value;
    } else {
      errors[gameId] = outcome.reason.message;
    }
  });

  return { results, errors };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameIds = searchParams.get('gameIds')?.split(',');

    if (!gameIds || gameIds.length === 0) {
      const teamsData = await fetchTeamsData();
      const allGameIds = extractGameIds(teamsData);
      
      if (!allGameIds.length) {
        return NextResponse.json({ error: 'No game IDs found' }, { status: 404 });
      }

      const { results, errors } = await fetchMultipleBoxScores(allGameIds);

      return NextResponse.json({
        data: results,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        totalGames: allGameIds.length,
        successfulFetches: Object.keys(results).length,
        failedFetches: Object.keys(errors).length
      });
    }

    const { results, errors } = await fetchMultipleBoxScores(gameIds);

    return NextResponse.json({
      data: results,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      totalGames: gameIds.length,
      successfulFetches: Object.keys(results).length,
      failedFetches: Object.keys(errors).length
    });

  } catch (error) {
    console.error('Error in GET route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch box scores' },
      { status: 500 }
    );
  }
}
