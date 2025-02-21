import { NextResponse } from 'next/server';
import axios from 'axios';
import type { NBAGamesOddsResponse } from '@/types/nbaGameOdds';

interface CachedData {
  data: NBAGamesOddsResponse;
  timestamp: number;
}

let cachedData: CachedData | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET() {
  try {
    // Check if we have valid cached data
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) 
      return NextResponse.json(cachedData.data);

    const response = await axios.get<NBAGamesOddsResponse>('https://api.the-odds-api.com/v4/sports/basketball_nba/odds', {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        regions: 'us',
        oddsFormat: 'american'
      }
    });

    // Update cache
    cachedData = {
      data: response.data,
      timestamp: Date.now()
    };

    // Log remaining requests in headers
    const remainingRequests = response.headers['x-requests-remaining'];
    const usedRequests = response.headers['x-requests-used'];
    console.log(`Odds API Requests - Remaining: ${remainingRequests}, Used: ${usedRequests}`);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching NBA odds:', error);
    
    // If we have stale cache, return it as fallback
    if (cachedData) 
      return NextResponse.json(cachedData.data);
    
    return NextResponse.json(
      { error: 'Failed to fetch NBA odds data' },
      { status: 500 }
    );
  }
}