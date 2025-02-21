import { create } from 'zustand';
import { NBATeam, Player } from '@/types/nba';
import { ProjectionWithAttributes } from '@/types/projections';
import { getTeams, getPlayers } from '@/app/actions/nba';

export interface LineMovement {
  direction: 'up' | 'down' | 'none'
  difference: number
}

interface NBAProjStore {
  teams: NBATeam[];
  players: Player[];
  projections: ProjectionWithAttributes[];
  cachedProjections: ProjectionWithAttributes[];
  isLoadingTeams: boolean;
  isLoadingPlayers: boolean;
  isLoadingProjections: boolean;
  error: string | null;
  lastProjectionsUpdate: Date | null;
  isFetchingProjections: boolean;
  loadTeams: () => Promise<void>;
  loadPlayers: () => Promise<void>;
  loadProjections: (forceRefresh?: boolean) => Promise<void>;
  calculateLineMovements: (newProjections: ProjectionWithAttributes[]) => Map<string, LineMovement>
}

// Time threshold for refetching projections (5 minutes)
const PROJECTION_REFRESH_THRESHOLD = 5 * 60 * 1000;

export const useNBAStore = create<NBAProjStore>((set, get) => ({
  teams: [],
  players: [],
  projections: [],
  cachedProjections: [],
  isLoadingTeams: false,
  isLoadingPlayers: false,
  isLoadingProjections: false,
  error: null,
  lastProjectionsUpdate: null,
  isFetchingProjections: false,

  calculateLineMovements: (newProjections: ProjectionWithAttributes[]) => {
    const { cachedProjections } = get()
    const lineMovements = new Map<string, LineMovement>()

    newProjections.forEach(newProj => {
      const cachedProj = cachedProjections.find(
        cached => cached.projection.id === newProj.projection.id
      )

      if (!cachedProj) {
        lineMovements.set(newProj.projection.id, { direction: 'none', difference: 0 })
        return
      }

      const newLine = newProj.projection.attributes.line_score
      const oldLine = cachedProj.projection.attributes.line_score

      if (newLine === oldLine) {
        lineMovements.set(newProj.projection.id, { direction: 'none', difference: 0 })
        return
      }

      const difference = newLine - oldLine
      lineMovements.set(newProj.projection.id, {
        direction: difference > 0 ? 'up' : 'down',
        difference: Math.abs(difference)
      })
    })

    return lineMovements
  },

  loadTeams: async () => {
    set({ isLoadingTeams: true, error: null });
    try {
      // First try to get teams from the cache
      const cachedTeamsResponse = await fetch('/api/nba/teams', {
        next: { tags: ['nba-teams'] }
      });

      if (cachedTeamsResponse.ok) {
        const data = await cachedTeamsResponse.json();
        set({ teams: data.body, isLoadingTeams: false });
        return;
      }

      // If cache fails, fetch fresh data
      const freshTeamsResponse = await fetch('/api/nba/teams', {
        method: 'POST', // This endpoint refreshes the data
        cache: 'no-store',
        next: { tags: ['nba-teams'] }
      });

      if (!freshTeamsResponse.ok) {
        throw new Error('Failed to fetch teams data');
      }

      const freshData = await freshTeamsResponse.json();
      set({ teams: freshData.body, isLoadingTeams: false });
    } catch (error) {
      console.error('Error loading teams:', error);
      set({ error: 'Failed to load teams', isLoadingTeams: false });
    }
  },

  loadPlayers: async () => {
    set({ isLoadingPlayers: true, error: null });
    try {
      const players = await getPlayers();
      set({ players, isLoadingPlayers: false });
    } catch (error) {
      set({ error: 'Failed to load players', isLoadingPlayers: false });
    }
  },

  loadProjections: async (forceRefresh = false) => {
    const currentState = get()
    
    // Check if we're already fetching or if it's too soon to fetch again
    if (currentState.isFetchingProjections) {
      return
    }

    const lastUpdate = currentState.lastProjectionsUpdate
    const timeSinceLastUpdate = lastUpdate ? Date.now() - lastUpdate.getTime() : Infinity

    // If we have projections and it's been less than 5 minutes, use cached data
    // Unless forceRefresh is true
    if (!forceRefresh && currentState.projections.length > 0 && timeSinceLastUpdate < PROJECTION_REFRESH_THRESHOLD) {
      return
    }
    
    set({ isLoadingProjections: true, error: null, isFetchingProjections: true })
    
    try {
      const response = await fetch('/api/projections?league=nba')
      if (!response.ok) throw new Error('Failed to fetch projections')
      
      const result = await response.json()
      
      // Ensure we have the data property and it's an array
      const data = result?.data?.data || []
      const projectionsArray = Array.isArray(data) ? data.map((projection: any) => ({
        projection,
        player: projection.connected?.new_player || null,
        stats: projection.connected?.stat_average || null
      })) : []
      
      // Store current projections as cached before updating
      set(state => ({ cachedProjections: state.projections }))
      
      set({ 
        projections: projectionsArray,
        lastProjectionsUpdate: new Date(),
        isLoadingProjections: false,
        isFetchingProjections: false,
        error: null
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load projections',
        isLoadingProjections: false,
        isFetchingProjections: false
      })
    }
  },
}))
