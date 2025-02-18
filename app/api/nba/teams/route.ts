import { NextResponse } from 'next/server';
import axios from 'axios';
import type { NBATeam, GameSchedule, TeamSchedule } from '@/types/nba';

const RAPID_API_KEY = '498668d019msh8d5c3dfa8440cd6p1a2b07jsn51e2b2f77ade';
const RAPID_API_HOST = 'tank01-fantasy-stats.p.rapidapi.com';

// Function to fetch teams data that can be used by other routes
export async function fetchTeamsData() {
  const response = await axios.get('https://tank01-fantasy-stats.p.rapidapi.com/getNBATeams', {
    params: {
      schedules: 'true',
      rosters: 'true',
      statsToGet: 'averages',
      topPerformers: 'true',
      teamStats: 'true'
    },
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': RAPID_API_HOST
    }
  });

  if (!response.data.body) {
    throw new Error('Invalid response format from API');
  }

  return response.data.body as NBATeam[];
}

// Function to extract game IDs from teams data
export function extractGameIds(teams: NBATeam[]): string[] {
  const gameIds = new Set<string>();
  
  teams.forEach(team => {
    if (team.teamSchedule) {
      Object.values(team.teamSchedule).forEach(game => {
        if (game.gameID) {
          gameIds.add(game.gameID);
        }
      });
    }
  });

  return Array.from(gameIds);
}

export async function GET() {
  try {
    const teams = await fetchTeamsData();
    const gameIds = extractGameIds(teams);

    return NextResponse.json(
      { 
        body: teams,
        gameIds: gameIds 
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching NBA teams:', error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: `Failed to fetch NBA teams: ${error.message}` },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
