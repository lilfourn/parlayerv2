'use server';

import { NBATeam, Player } from '@/types/nba';
import { unstable_cache } from 'next/cache';

export const getTeams = unstable_cache(
  async () => {
    const res = await fetch('http://localhost:3000/api/nba/teams', {
      next: { revalidate: 300 } // 5 minutes
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch teams');
    }

    const data = await res.json();
    return data.body as NBATeam[];
  },
  ['nba-teams'],
  {
    revalidate: 300, // 5 minutes
    tags: ['nba-teams']
  }
);

export const getPlayers = unstable_cache(
  async () => {
    const res = await fetch('http://localhost:3000/api/nba/playerInfo', {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch players');
    }

    const data = await res.json();
    return data.data as Player[];
  },
  ['nba-players'],
  {
    revalidate: 300,
    tags: ['nba-players']
  }
);

export async function refreshTeams() {
  const res = await fetch('http://localhost:3000/api/nba/teams', {
    method: 'POST',
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to refresh teams');
  }

  const data = await res.json();
  return data.body as NBATeam[];
}
