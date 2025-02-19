'use client';

import { TeamCard } from '@/components/nba/teamCard';
import { PlayerCard } from '@/components/nba/playerCard';
import { PlayerFilters } from '@/components/nba/player-filters';
import { NBATabs } from '@/components/nba/nbaTabs';
import type { NBATeam, Player, NBATab } from '@/types/nba';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useNBAStore } from '@/store/nba-store';
import { useSidebarStore } from '@/store/sidebar-store';

async function refreshTeams() {
  const res = await fetch('/api/nba/teams', {
    method: 'POST',
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to refresh teams');
  }

  const data = await res.json();
  return data.body as NBATeam[];
}

async function getPlayers() {
  const res = await fetch('/api/nba/playerInfo', {
    next: { revalidate: 300 } // Revalidate every 5 minutes
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch players');
  }

  const data = await res.json();
  return data.data as Player[];
}

export default function NBADashboard() {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [showTopPlayersOnly, setShowTopPlayersOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<NBATab>('teams');

  // Get teams from global store
  const { teams, loadTeams, isLoadingTeams } = useNBAStore();
  const { width: sidebarWidth, isExpanded } = useSidebarStore();

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Fetch players data
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };
    fetchPlayers();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshedTeams = await refreshTeams();
      loadTeams(); // This will update the global store
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter players based on search and team selection
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.longName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = selectedTeam === 'all' || player.team === selectedTeam;
      return matchesSearch && matchesTeam;
    });
  }, [players, searchQuery, selectedTeam]);

  // Deduplicate and process players
  const processedPlayers = useMemo(() => {
    // Deduplicate players
    const uniquePlayers = filteredPlayers.reduce((acc, player) => {
      const nameParts = player.longName?.split(' ') || [];
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ');
      const uniqueKey = `${firstName}-${lastName}-${player.team}`;
      
      if (!acc[uniqueKey]) {
        acc[uniqueKey] = player;
      }
      return acc;
    }, {} as Record<string, Player>);

    // Sort by points
    return Object.values(uniquePlayers).sort((a, b) => {
      const aPoints = a.stats?.pts ? parseFloat(a.stats.pts) : 0;
      const bPoints = b.stats?.pts ? parseFloat(b.stats.pts) : 0;
      return bPoints - aPoints;
    });
  }, [filteredPlayers]);

  const displayedPlayers = showTopPlayersOnly ? 
    processedPlayers.slice(0, 12) : 
    processedPlayers;

  return (
    <div 
      className="relative min-h-screen w-full"
      style={{
        paddingLeft: `${sidebarWidth + -8}px`,
        paddingRight: `${-16}px`,
        transition: 'padding 0.4s ease'
      }}
    >
      <div className="fixed top-0 right-4 p-4 z-10">
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-accent/5 hover:border-purple-600/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all duration-300 shadow-sm border border-border/40 rounded-lg"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="w-full p-6">
        <NBATabs activeTab={activeTab} onChange={setActiveTab} />
        
        {activeTab === 'teams' ? (
          <div className="w-full mt-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {teams.map((team) => (
                <TeamCard 
                  key={team.teamID} 
                  team={team}
                  sidebarWidth={sidebarWidth}
                />
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            <PlayerFilters
              teams={teams}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
              showTopPlayersOnly={showTopPlayersOnly}
              onShowTopPlayersChange={setShowTopPlayersOnly}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {displayedPlayers.map((player) => (
                <PlayerCard 
                  key={player.playerID} 
                  player={player}
                  sidebarWidth={sidebarWidth}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}