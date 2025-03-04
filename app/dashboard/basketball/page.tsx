'use client';

import { TeamCard } from '@/components/nba/teamCard';
import { PlayerCard} from '@/components/nba/playerCard';
import { PlayerFilters } from '@/components/nba/player-filters';
import { NBATabs } from '@/components/nba/nbaTabs';
import { ProjectionTable } from '@/components/nba/projectionTable';
import type { NBATeam, Player, NBATab } from '@/types/nba';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useNBAStore } from '@/store/nba-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { Sparkles } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { Spinner } from '@/components/ui/spinner';
import { CyclingText } from '@/components/ui/cycling-text';

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
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [activeTab, setActiveTab] = useState<NBATab>('teams');

  // Get teams from global store
  const { teams, loadTeams, isLoadingTeams } = useNBAStore();
  const { width: sidebarWidth, isExpanded } = useSidebarStore();

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Fetch players data once
  useEffect(() => {
    async function fetchPlayers() {
      try {
        setIsLoadingPlayers(true);
        const fetchedPlayers = await getPlayers();
        setPlayers(fetchedPlayers);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setIsLoadingPlayers(false);
      }
    }
    
    fetchPlayers();
  }, []);

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

  // Calculate max stats from all players
  const maxStats = useMemo(() => {
    return players.reduce((acc, player) => {
      if (player.stats) {
        acc.pts = Math.max(acc.pts, parseFloat(player.stats.pts || '0'));
        acc.ast = Math.max(acc.ast, parseFloat(player.stats.ast || '0'));
        acc.reb = Math.max(acc.reb, parseFloat(player.stats.reb || '0'));
        acc.stl = Math.max(acc.stl, parseFloat(player.stats.stl || '0'));
        acc.blk = Math.max(acc.blk, parseFloat(player.stats.blk || '0'));
      }
      return acc;
    }, { pts: 0, ast: 0, reb: 0, stl: 0, blk: 0 });
  }, [players]);

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
      <Toaster />
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
        ) : activeTab === 'projections' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            <ProjectionTable className="w-full" />
          </motion.div>
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
              {isLoadingPlayers ? (
                <div className="col-span-full flex flex-col justify-center items-center min-h-[300px] space-y-6">
                  <Spinner size="lg" />
                  <CyclingText 
                    messages={[
                      "Loading player statistics...",
                      "Gathering the latest NBA data...",
                      "Player cards will appear shortly...",
                      "Crunching the numbers...",
                    ]}
                    className="text-muted-foreground text-lg"
                    interval={3000}
                  />
                </div>
              ) : (
                displayedPlayers.map((player) => (
                  <PlayerCard 
                    key={`${player.longName}-${player.team}`} 
                    player={player}
                    maxStats={maxStats}
                    sidebarWidth={sidebarWidth}
                  />
                ))
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}