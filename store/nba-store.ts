import { create } from 'zustand';
import { NBATeam, Player } from '@/types/nba';
import { ProjectionWithAttributes } from '@/types/projections';
import { getTeams, getPlayers } from '@/app/actions/nba';

interface LineMovement {
  direction: 'up' | 'down' | 'none'
  difference: number
}

interface NBAProjStore {
  teams: NBATeam[];
  players: Player[];
  projections: ProjectionWithAttributes[]
  cachedProjections: ProjectionWithAttributes[]
  isLoadingTeams: boolean;
  isLoadingPlayers: boolean;
  isLoadingProjections: boolean;
  error: string | null;
  lastProjectionsUpdate: Date | null;
  loadTeams: () => Promise<void>;
  loadPlayers: () => Promise<void>;
  loadProjections: () => Promise<void>;
  calculateLineMovements: (newProjections: ProjectionWithAttributes[]) => Map<string, LineMovement>
}

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
      const teams = await getTeams();
      set({ teams, isLoadingTeams: false });
    } catch (error) {
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

  loadProjections: async () => {
    const currentState = get()
    
    set({ isLoadingProjections: true, error: null })
    
    try {
      // Fetch NBA projections
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
        isLoadingProjections: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load projections',
        isLoadingProjections: false 
      })
    }
  },
}))
