'use client';

import { TeamCard } from '@/components/nba/teamCard';
import { PlayerCard } from '@/components/nba/playerCard';
import { PlayerFilters } from '@/components/nba/player-filters';
import { NBATabs } from '@/components/nba/nbaTabs';
import type { NBATeam, Player } from '@/types/nba';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

async function getTeams() {
  const res = await fetch('/api/nba/teams', {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch teams');
  }

  const data = await res.json();
  return data.body as NBATeam[];
}

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
  const [sidebarWidth, setSidebarWidth] = useState(72);
  const [teams, setTeams] = useState<NBATeam[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isRefreshingTeams, setIsRefreshingTeams] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [showTopPlayersOnly, setShowTopPlayersOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const sortedTeams = useMemo(() => 
    [...teams].sort((a, b) => parseInt(b.wins) - parseInt(a.wins)), 
    [teams]
  );
  
  // Deduplicate and process players
  const processedPlayers = useMemo(() => {
    // Deduplicate players
    const uniquePlayers = players.reduce((acc, player) => {
      const nameParts = player.longName?.split(' ') || [];
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ');
      const uniqueKey = `${firstName}-${lastName}-${player.team}`;
      
      if (!acc[uniqueKey]) {
        acc[uniqueKey] = player;
      }
      return acc;
    }, {} as Record<string, Player>);

    // Filter players
    const filtered = Object.values(uniquePlayers).filter(player => {
      const matchesTeam = selectedTeam === "all" || player.team === selectedTeam;
      const matchesSearch = searchQuery === "" || 
        player.longName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTeam && matchesSearch;
    });

    // Sort by points
    return filtered.sort((a, b) => {
      const aPoints = a.stats?.pts ? parseFloat(a.stats.pts) : 0;
      const bPoints = b.stats?.pts ? parseFloat(b.stats.pts) : 0;
      return bPoints - aPoints;
    });
  }, [players, selectedTeam, searchQuery]);

  const displayedPlayers = showTopPlayersOnly ? 
    processedPlayers.slice(0, 12) : 
    processedPlayers;

  const handleRefreshTeams = async () => {
    setIsRefreshingTeams(true);
    try {
      const data = await refreshTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error refreshing teams:', error);
    } finally {
      setIsRefreshingTeams(false);
    }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        const data = await getPlayers();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setIsLoadingPlayers(false);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector('[class*="fixed left-0 top-0 h-screen"]')
    if (!sidebar) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarWidth(entry.contentRect.width)
      }
    });

    resizeObserver.observe(sidebar);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <motion.div 
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ 
        paddingLeft: `${sidebarWidth + 8}px`,
        paddingRight: '0.5rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl text-white font-bold">NBA Dashboard</h1>
          <Button 
            variant="secondary"
            size="default"
            onClick={handleRefreshTeams}
            disabled={isRefreshingTeams}
            className="bg-gray-800/50 hover:bg-gray-700/50 text-slate-300 border border-gray-700/50 shadow-sm transition-colors"
          >
            <RefreshCw 
              className={`h-4 w-4 mr-2 ${isRefreshingTeams ? 'animate-spin' : ''}`} 
            />
            {isRefreshingTeams ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <NBATabs defaultTab="teams">
          {/* Teams Tab */}
          <div className="space-y-4">
            {sortedTeams.map((team) => (
              <TeamCard 
                key={team.teamID} 
                team={team} 
                sidebarWidth={sidebarWidth}
              />
            ))}
          </div>

          {/* Stats Tab */}
          <div className="space-y-6">
            {/* Filters Section */}
            <PlayerFilters
              teams={teams}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
              showTopPlayersOnly={showTopPlayersOnly}
              onShowTopPlayersChange={setShowTopPlayersOnly}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white/90 tracking-wide">
                Players {showTopPlayersOnly ? "(Top 12)" : ""}
              </h2>
              <div className="text-sm text-slate-400">
                {isLoadingPlayers ? (
                  "Loading player stats..."
                ) : (
                  `Showing ${displayedPlayers.length} of ${processedPlayers.length} players`
                )}
              </div>
            </div>

            {/* Player Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPlayers.map((player) => {
                const nameParts = player.longName?.split(' ') || [];
                const lastName = nameParts.pop() || '';
                const firstName = nameParts.join(' ');
                const uniqueKey = `${firstName}-${lastName}-${player.team}`;
                
                return (
                  <PlayerCard 
                    key={uniqueKey}
                    player={player}
                    sidebarWidth={sidebarWidth}
                  />
                );
              })}
            </div>
          </div>

          {/* Projections Tab */}
          <div>
            <h2 className="text-2xl font-bold text-white/90 tracking-wide">
              Coming Soon
            </h2>
          </div>
        </NBATabs>
      </div>
    </motion.div>
  );
}