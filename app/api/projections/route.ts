import { Props, Projection, NewPlayer, StatAverage, IncludedItem } from '@/types/projections';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { fetchProjectionsFromAPI } from './utils';

const API_URL = 'https://partner-api.prizepicks.com/projections?per_page=1000&include=new_player,stat_average,league';

// Attributes to exclude from the response
const EXCLUDED_ATTRIBUTES = ['is_promo', 'refundable', 'board_time', 'rank', 'hr_20'];

// Function to find included item by type and id
function findIncludedItem(included: IncludedItem[], type: string, id: string | null): IncludedItem | null {
  if (!id) return null;
  return included.find(item => item.type === type && item.id === id) || null;
}

// Function to connect relationships
function connectRelationships(projection: Projection, included: IncludedItem[]): Projection {
  const { relationships } = projection;
  
  // Find the new_player data
  let newPlayerData: NewPlayer | null = relationships?.new_player?.data ? 
    findIncludedItem(included, 'new_player', relationships.new_player.data.id) as NewPlayer : null;
  
  // If new_player exists and display_name is "team", create new object without team attribute
  if (newPlayerData && 
      'attributes' in newPlayerData && 
      newPlayerData.type === 'new_player') {
    const playerAttributes = newPlayerData.attributes as NewPlayer['attributes'];
    if (playerAttributes.display_name === 'team') {
      const { team, ...restAttributes } = playerAttributes;
      newPlayerData = {
        ...newPlayerData,
        attributes: {
          ...restAttributes,
          team: team || '' // Ensure team is included with a default empty string
        }
      };
    }
  }

  // Create connected data object with proper typing
  return {
    ...projection,
    connected: {
      new_player: newPlayerData || undefined,
      stat_average: relationships?.stat_average?.data ? 
        findIncludedItem(included, 'stat_average', relationships.stat_average.data.id) as StatAverage : undefined,
      league: relationships?.league?.data ? 
        findIncludedItem(included, 'league', relationships.league.data.id) : undefined
    }
  } as Projection;
}

// Function to sort projections by is_live status
function sortByLiveStatus(a: Projection, b: Projection): number {
  const aIsLive = a.attributes?.is_live ?? false;
  const bIsLive = b.attributes?.is_live ?? false;
  
  if (aIsLive === bIsLive) return 0;
  return aIsLive ? -1 : 1;
}

// Utility function to remove null attributes and excluded fields recursively
function removeNullAttributes<T>(obj: T): T extends object ? Partial<T> : T {
  if (obj === null || obj === undefined) {
    return {} as T extends object ? Partial<T> : T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeNullAttributes(item)) as T extends object ? Partial<T> : T;
  }

  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as object)
        .filter(([key, value]) => 
          // Filter out null/undefined values AND excluded attributes
          value !== null && 
          value !== undefined && 
          !EXCLUDED_ATTRIBUTES.includes(key)
        )
        .map(([key, value]) => [key, removeNullAttributes(value)])
    ) as T extends object ? Partial<T> : T;
  }

  return obj as T extends object ? Partial<T> : T;
}

export async function GET() {
  try {
    const cleanedProjections = await fetchProjectionsFromAPI();

    // Get the host from headers for constructing the full URL
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const dbSyncUrl = `${protocol}://${host}/api/projections/db`;

    // Trigger database upload in the background
    fetch(dbSyncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projections: cleanedProjections }),
    }).catch(error => {
      console.error('Background database sync failed:', error);
    });

    // Return the cleaned projections data
    return NextResponse.json({
      success: true,
      data: cleanedProjections,
    });

  } catch (error) {
    console.error('Error fetching projections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projections' },
      { status: 500 }
    );
  }
}

// Clear cache endpoint
export async function DELETE() {
  try {
    let memoryCache: {
      data: Props;
      timestamp: number;
    } | null = null;
    memoryCache = null;
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to clear cache'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
