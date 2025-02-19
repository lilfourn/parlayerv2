import { create } from 'zustand';
import { NBATeam, Player } from '@/types/nba';
import { getTeams, getPlayers } from '@/app/actions/nba';

interface NBAStore {
  teams: NBATeam[];
  players: Player[];
  isLoadingTeams: boolean;
  isLoadingPlayers: boolean;
  error: string | null;
  loadTeams: () => Promise<void>;
  loadPlayers: () => Promise<void>;
}

export const useNBAStore = create<NBAStore>((set) => ({
  teams: [],
  players: [],
  isLoadingTeams: false,
  isLoadingPlayers: false,
  error: null,
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
}));
