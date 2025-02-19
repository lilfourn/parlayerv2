import axios from 'axios';
import { headers } from '@/config/api-config';

interface PlayerHeadshot {
  playerId: string;
  headshotUrl: string | null;
  nbaComHeadshot: string;
  espnHeadshot: string;
}

export async function getPlayerHeadshots(playerIds: string[]): Promise<PlayerHeadshot[]> {
  const headshots: PlayerHeadshot[] = [];
  const batchSize = 10;

  for (let i = 0; i < playerIds.length; i += batchSize) {
    const batch = playerIds.slice(i, i + batchSize);
    const batchPromises = batch.map(async (playerId) => {
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
        const playerData = response.data?.body?.[0];
        
        if (playerData) {
          // Try multiple headshot sources
          const nbaComHeadshot = `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
          const espnHeadshot = playerData.espnHeadshot || `https://a.espncdn.com/i/headshots/nba/players/full/${playerId}.png`;
          
          const result: PlayerHeadshot = {
            playerId,
            headshotUrl: playerData.headshotUrl || null,
            nbaComHeadshot,
            espnHeadshot
          };
          return result;
        }
        return null;
      } catch (error) {
        console.error(`Error fetching headshot for player ${playerId}:`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter((result): result is PlayerHeadshot => 
      result !== null && 
      typeof result.playerId === 'string' &&
      typeof result.nbaComHeadshot === 'string' &&
      typeof result.espnHeadshot === 'string'
    );
    headshots.push(...validResults);

    // Add a small delay between batches to respect rate limits
    if (i + batchSize < playerIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return headshots;
}
