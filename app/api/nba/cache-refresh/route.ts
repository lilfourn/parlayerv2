import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import axios from 'axios';

// Only allow this endpoint to be called from cron jobs or internal services
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

async function validateInternalRequest(request: Request) {
  const authHeader = request.headers.get('x-api-key');
  return authHeader === INTERNAL_API_KEY;
}

export async function POST(request: Request) {
  // Validate internal request
  if (!await validateInternalRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Revalidate the cache for both teams and players
    revalidateTag('nba-teams');
    revalidateTag('nba-players');

    // Trigger a fresh fetch to update Redis cache
    await Promise.all([
      fetch('http://localhost:3000/api/nba/teams', {
        method: 'POST',
        headers: new Headers({
          'x-api-key': INTERNAL_API_KEY || '',
          'Content-Type': 'application/json'
        })
      }),
      fetch('http://localhost:3000/api/nba/playerInfo', {
        method: 'POST',
        headers: new Headers({
          'x-api-key': INTERNAL_API_KEY || '',
          'Content-Type': 'application/json'
        })
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Cache refreshed successfully' 
    });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    return NextResponse.json(
      { error: 'Failed to refresh cache' },
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
    const [teamsResponse, playersResponse] = await Promise.all([
      fetch('http://localhost:3000/api/nba/teams', {
        headers: new Headers({
          'x-api-key': INTERNAL_API_KEY || '',
          'Content-Type': 'application/json'
        })
      }),
      fetch('http://localhost:3000/api/nba/playerInfo', {
        headers: new Headers({
          'x-api-key': INTERNAL_API_KEY || '',
          'Content-Type': 'application/json'
        })
      })
    ]);

    return NextResponse.json({
      teamsCache: teamsResponse.headers.get('cache-status'),
      playersCache: playersResponse.headers.get('cache-status'),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking cache status:', error);
    return NextResponse.json(
      { error: 'Failed to check cache status' },
      { status: 500 }
    );
  }
}
