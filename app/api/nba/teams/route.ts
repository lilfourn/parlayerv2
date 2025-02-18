import { NextResponse } from 'next/server';
import axios from 'axios';
import type { NBATeam } from '@/types/nba';

const RAPID_API_KEY = '498668d019msh8d5c3dfa8440cd6p1a2b07jsn51e2b2f77ade';
const RAPID_API_HOST = 'tank01-fantasy-stats.p.rapidapi.com';

export async function GET() {
  try {
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

    return NextResponse.json(
      { body: response.data.body as NBATeam[] },
      { status: 200 }
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
