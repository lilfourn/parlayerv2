import { Projection, IncludedItem, NewPlayer, StatAverage } from '@/types/projections';

const API_URL = 'https://partner-api.prizepicks.com/projections?per_page=1000&include=new_player,stat_average,league';

interface League {
  type: string;
  id: string;
  attributes: {
    active: boolean;
    f2p_enabled: boolean;
    icon: string;
    image_url: string;
    last_five_games_enabled: boolean;
    league_icon_id: number;
    name: string;
    projections_count: number;
    show_trending: boolean;
  };
  relationships: {
    projection_filters: {
      data: any[];
    };
  };
}

// Function to find included item by type and id
export function findIncludedItem<T extends IncludedItem | League>(included: (IncludedItem | League)[], type: string, id: string | null): T | null {
  if (!id) return null;
  return (included.find(item => item.type === type && item.id === id) || null) as T | null;
}

// Function to connect relationships
export function connectRelationships(projection: Projection, included: (IncludedItem | League)[]): Projection {
  const { relationships } = projection;
  
  // Find the new_player data
  const newPlayerData = relationships?.new_player?.data ? 
    findIncludedItem<NewPlayer>(included, 'new_player', relationships.new_player.data.id) : null;
  
  // If new_player exists and display_name is "team", create new object without team attribute
  if (newPlayerData && 
      'attributes' in newPlayerData && 
      newPlayerData.type === 'new_player') {
    const playerAttributes = newPlayerData.attributes;
    if (playerAttributes.display_name === 'team') {
      const { team, ...restAttributes } = playerAttributes;
      newPlayerData.attributes = {
        ...restAttributes,
        team: team || '' // Ensure team is included with a default empty string
      };
    }
  }

  // Create connected data object with proper typing
  const connectedData: Projection['connected'] = {
    new_player: newPlayerData || undefined,
    stat_average: relationships?.stat_average?.data ? 
      findIncludedItem<StatAverage>(included, 'stat_average', relationships.stat_average.data.id) || undefined : undefined,
    league: relationships?.league?.data ? 
      findIncludedItem<League>(included, 'league', relationships.league.data.id) || undefined : undefined
  };

  return {
    ...projection,
    connected: connectedData
  };
}

// Function to sort projections by is_live status
export function sortByLiveStatus(a: Projection, b: Projection): number {
  const aIsLive = a.attributes?.is_live ?? false;
  const bIsLive = b.attributes?.is_live ?? false;
  
  if (aIsLive === bIsLive) return 0;
  return aIsLive ? -1 : 1;
}

// Utility function to remove null attributes and excluded fields recursively
export function removeNullAttributes<T>(obj: T): T extends object ? Partial<T> : T {
  if (obj === null || obj === undefined) {
    return {} as T extends object ? Partial<T> : T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeNullAttributes(item)) as T extends object ? Partial<T> : T;
  }

  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as object)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => [key, removeNullAttributes(value)])
    ) as T extends object ? Partial<T> : T;
  }

  return obj as T extends object ? Partial<T> : T;
}

export async function fetchProjectionsFromAPI() {
  const response = await fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projections');
  }

  const data = await response.json();
  
  // Process the response data
  const projections = data.data.map((projection: Projection) => 
    connectRelationships(projection, data.included)
  ).sort(sortByLiveStatus);

  // Clean the data by removing null attributes and excluded fields
  return removeNullAttributes(projections);
}
