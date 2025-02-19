import { NextResponse } from 'next/server';
import axios from 'axios';
import { headers } from '@/config/api-config';
import { getAllNBAPlayerIds } from '../teams/getAllPlayers';
import { getPlayerHeadshots } from './getPlayerHeadshots';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerIds = searchParams.get('playerIds');
    
    // If no specific player IDs are provided, fetch all players
    const targetPlayerIds = playerIds ? 
      playerIds.split(',') : 
      await getAllNBAPlayerIds();

    const playerInfoPromises = targetPlayerIds.map(async (playerId) => {
      const options = {
        method: 'GET',
        url: 'https://tank01-fantasy-stats.p.rapidapi.com/getNBAPlayerInfo',
        params: {
          playerID: playerId,
          statsToGet: 'averages'
        },
        headers
      };

      try {
        const response = await axios.request(options);
        return response.data;
      } catch (error) {
        console.error(`Error fetching player ${playerId}:`, error);
        return null;
      }
    });

    // Process players in batches of 10 to avoid rate limiting
    const batchSize = 10;
    const playerInfo = [];
    const headshots = await getPlayerHeadshots(targetPlayerIds);
    const headshotMap = new Map(headshots.map(h => [h.playerId, {
      headshotUrl: h.headshotUrl,
      nbaComHeadshot: h.nbaComHeadshot,
      espnHeadshot: h.espnHeadshot
    }]));
    
    for (let i = 0; i < targetPlayerIds.length; i += batchSize) {
      const batch = targetPlayerIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(id => playerInfoPromises[targetPlayerIds.indexOf(id)])
      );
      
      // Merge headshot URLs with player info
      const enrichedResults = batchResults
        .filter(Boolean)
        .map(result => {
          const player = result.body?.[0];
          if (!player) return null;
          
          const headshot = headshotMap.get(player.playerID) || {};
          return {
            ...player,
            ...headshot
          };
        })
        .filter(Boolean);

      playerInfo.push(...enrichedResults);
      
      // Add a small delay between batches to respect rate limits
      if (i + batchSize < targetPlayerIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successfulFetches = playerInfo.length;
    const failedFetches = targetPlayerIds.length - successfulFetches;

    return NextResponse.json({
      success: true,
      data: playerInfo,
      totalPlayers: playerInfo.length,
      message: `Successfully fetched data for ${successfulFetches} players${failedFetches > 0 ? `, ${failedFetches} requests failed` : ''}`
    });
  } catch (error) {
    console.error('Error in player info route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player information' },
      { status: 500 }
    );
  }
}