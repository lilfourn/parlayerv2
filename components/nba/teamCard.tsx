'use client';

import { Card } from '@/components/ui/card';
import { 
  NBATeam, 
  Player, 
  PlayerStats, 
  BoxScoreResponse, 
  GAME_STATUS,
  GAME_STATUS_TEXT,
  GameStatusCode ,
  GameSchedule
} from '@/types/nba';
import { BarChart } from '@tremor/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Trophy, Star, Target, Info, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameStatsDialog } from './gameStatsDialog';
import { PlayerAvatar } from './playerAvatar';

interface TeamCardProps {
  team: NBATeam;
  sidebarWidth: number;
}

// Team color mapping
const NBA_TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  'ATL': { primary: 'red', secondary: 'green' },
  'BOS': { primary: 'green', secondary: 'yellow' },
  'BKN': { primary: 'zinc', secondary: 'zinc' },
  'CHA': { primary: 'purple', secondary: 'teal' },
  'CHI': { primary: 'red', secondary: 'zinc' },
  'CLE': { primary: 'red', secondary: 'blue' },
  'DAL': { primary: 'blue', secondary: 'blue' },
  'DEN': { primary: 'blue', secondary: 'yellow' },
  'DET': { primary: 'red', secondary: 'blue' },
  'GSW': { primary: 'blue', secondary: 'yellow' },
  'HOU': { primary: 'red', secondary: 'zinc' },
  'IND': { primary: 'blue', secondary: 'yellow' },
  'LAC': { primary: 'red', secondary: 'blue' },
  'LAL': { primary: 'purple', secondary: 'yellow' },
  'MEM': { primary: 'blue', secondary: 'yellow' },
  'MIA': { primary: 'red', secondary: 'yellow' },
  'MIL': { primary: 'green', secondary: 'cream' },
  'MIN': { primary: 'blue', secondary: 'green' },
  'NOP': { primary: 'blue', secondary: 'yellow' },
  'NYK': { primary: 'blue', secondary: 'orange' },
  'OKC': { primary: 'blue', secondary: 'orange' },
  'ORL': { primary: 'blue', secondary: 'zinc' },
  'PHI': { primary: 'blue', secondary: 'red' },
  'PHX': { primary: 'purple', secondary: 'orange' },
  'POR': { primary: 'red', secondary: 'zinc' },
  'SAC': { primary: 'purple', secondary: 'zinc' },
  'SAS': { primary: 'zinc', secondary: 'zinc' },
  'TOR': { primary: 'red', secondary: 'zinc' },
  'UTA': { primary: 'blue', secondary: 'yellow' },
  'WAS': { primary: 'red', secondary: 'blue' },
};

function getTeamColors(teamAbv: string) {
  const colors = NBA_TEAM_COLORS[teamAbv] || { primary: 'blue', secondary: 'zinc' };
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    gradientFrom: `from-${colors.primary}-500/20`,
    gradientVia: `via-${colors.primary}-400/10`,
    gradientTo: `to-${colors.primary}-300/5`,
    hoverGradientFrom: `group-hover:from-${colors.primary}-500/20`,
    hoverGradientVia: `group-hover:via-${colors.primary}-400/10`,
    hoverGradientTo: `group-hover:to-${colors.primary}-300/5`,
    borderColor: `border-${colors.primary}-500/20`,
    offensiveBarFrom: `from-${colors.primary}-500/90`,
    offensiveBarTo: `to-${colors.primary}-400/90`,
    defensiveBarFrom: `from-${colors.secondary}-500/90`,
    defensiveBarTo: `to-${colors.secondary}-400/90`,
  };
}

interface StatDisplay {
  label: string;
  key: keyof PlayerStats;
  format: (value: string | number) => string;
}

const playerStatDisplays: StatDisplay[] = [
  { label: "Points", key: "pts", format: (v) => String(v) },
  { label: "Rebounds", key: "reb", format: (v) => String(v) },
  { label: "Assists", key: "ast", format: (v) => String(v) },
  { label: "Steals", key: "stl", format: (v) => String(v) },
  { label: "Blocks", key: "blk", format: (v) => String(v) },
  { label: "FG%", key: "fgp", format: (v) => `${Number(v).toFixed(1)}%` },
  { label: "3P%", key: "tptfgp", format: (v) => `${Number(v).toFixed(1)}%` },
  { label: "FT%", key: "ftp", format: (v) => `${Number(v).toFixed(1)}%` },
  { label: "Minutes", key: "mins", format: (v) => String(v) },
  { label: "Games", key: "gamesPlayed", format: (v) => String(v) },
];

const statDescriptions: Record<string, { full: string; description: string }> = {
  pts: {
    full: "Points",
    description: "Points scored per game (PPG)"
  },
  ast: {
    full: "Assists",
    description: "Passes leading to made baskets per game (APG)"
  },
  reb: {
    full: "Rebounds",
    description: "Offensive and defensive rebounds per game (RPG)"
  },
  blk: {
    full: "Blocks",
    description: "Shots blocked per game (BPG)"
  },
  stl: {
    full: "Steals",
    description: "Steals per game (SPG)"
  },
  tptfgm: {
    full: "Three-Pointers Made",
    description: "Three-point field goals made per game (3PM)"
  },
  TOV: {
    full: "Turnovers",
    description: "Turnovers per game (TOPG)"
  }
};

function PlayerStatsDialog({ player, stats }: { player: Player; stats: PlayerStats }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const teamColors = getTeamColors(player.team);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div 
          className={cn(
            "flex items-center gap-2 rounded-lg p-1.5 pr-3",
            "bg-gray-800/30 hover:bg-gray-800/50",
            "group/player cursor-pointer",
            "transition-all duration-200 ease-out"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsDialogOpen(true);
          }}
        >
          <Avatar className="h-8 w-8 rounded-md overflow-hidden border border-white/10">
            <AvatarImage 
              src={player.nbaComHeadshot} 
              alt={player.longName}
              className="object-cover object-top"
            />
            <AvatarFallback className="bg-gray-800 text-white/80 text-xs">
              {player.longName.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm text-white/70 group-hover/player:text-white transition-colors">
              {player.longName} - {player.pos}
            </span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent 
        className={cn(
          "sm:max-w-[425px] border-0",
          "backdrop-blur-md shadow-xl",
          "p-0 overflow-hidden",
          "bg-gradient-to-br",
          teamColors.gradientFrom,
          teamColors.gradientVia,
          teamColors.gradientTo,
          teamColors.borderColor
        )}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          setIsDialogOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Close button */}
          <button
            onClick={() => setIsDialogOpen(false)}
            className={cn(
              "absolute right-4 top-4 z-10",
              "p-1.5 rounded-full",
              "text-white/70 hover:text-white",
              "bg-white/5 hover:bg-white/10",
              "transition-colors duration-200"
            )}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header with gradient */}
          <div className={cn(
            "p-6 pb-8",
            "bg-black/20",
            "border-b border-white/10"
          )}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <Avatar className="h-12 w-12 rounded-xl overflow-hidden border border-white/10">
                    <AvatarImage 
                      src={player.nbaComHeadshot} 
                      alt={player.longName}
                      className="object-cover object-top w-full h-full"
                      style={{ objectFit: 'cover', objectPosition: 'center top' }}
                    />
                    <AvatarFallback className="bg-gray-800">
                      {player.longName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">{player.longName}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 font-medium">
                      {player.pos}
                    </span>
                    <span>•</span>
                    <span>#{player.jerseyNum}</span>
                    {player.height && (
                      <>
                        <span>•</span>
                        <span>{formatHeight(player.height)}</span>
                      </>
                    )}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Stats Grid */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {playerStatDisplays.map((stat) => (
              <div 
                key={stat.key as string} 
                className={cn(
                  "p-3 rounded-xl",
                  "backdrop-blur-sm",
                  "border border-white/10",
                  "flex flex-col gap-1",
                  "transition-all duration-200",
                  "bg-gradient-to-br",
                  teamColors.gradientFrom,
                  teamColors.gradientVia,
                  teamColors.gradientTo
                )}
              >
                <span className="text-sm text-white/50 font-medium">{stat.label}</span>
                <span className="text-lg font-bold text-white">
                  {stat.format(stats[stat.key])}
                </span>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatHeight(height: string | undefined) {
  if (!height) return '';
  
  // If already in the correct format, return as is
  if (height.includes("'") && height.includes('"')) return height;
  
  // If it's in the format "6-11", convert to "6'11""
  const parts = height.split('-');
  if (parts.length === 2) {
    return `${parts[0]}'${parts[1]}"`;
  }
  
  return height;
}

interface BoxScore {
  teamStats: Record<string, { pts: string }>;
  gameStatusCode: GameStatusCode;
}

export function TeamCard({ team, sidebarWidth }: TeamCardProps) {
  const [boxScores, setBoxScores] = useState<Record<string, BoxScoreResponse['body']>>({});
  const [isLoadingBoxScores, setIsLoadingBoxScores] = useState(false);
  const [allTeams, setAllTeams] = useState<NBATeam[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [gameFilter, setGameFilter] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        // Check if we have cached data
        const cachedTeams = sessionStorage.getItem('nbaTeams');
        const cachedTimestamp = sessionStorage.getItem('nbaTeamsTimestamp');
        const now = Date.now();
        
        // Use cached data if it's less than 5 minutes old
        if (cachedTeams && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 300000) {
          setAllTeams(JSON.parse(cachedTeams));
          return;
        }

        const response = await fetch('/api/nba/teams');
        const data = await response.json();
        
        // Cache the new data
        sessionStorage.setItem('nbaTeams', JSON.stringify(data.body));
        sessionStorage.setItem('nbaTeamsTimestamp', now.toString());
        
        setAllTeams(data.body);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchAllTeams();
  }, []);

  // Fetch box scores when expanded
  useEffect(() => {
    if (isExpanded && Object.keys(boxScores || {}).length === 0) {
      fetchBoxScores();
    }
  }, [isExpanded]);

  const fetchBoxScores = async () => {
    try {
      setIsLoadingBoxScores(true);
      // Only fetch box scores for completed games
      const completedGames = Object.entries(team.teamSchedule || {})
        .filter(([_, game]) => isGameCompleted(game.gameTime_epoch))
        .map(([_, game]) => game.gameID);

      if (completedGames.length === 0) {
        setBoxScores({});
        return;
      }

      const response = await fetch(`/api/nba/boxScores?gameIds=${completedGames.join(',')}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch box scores');
      }

      setBoxScores(data.data);
    } catch (error) {
      console.error('Error fetching box scores:', error);
    } finally {
      setIsLoadingBoxScores(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking a dialog or its backdrop
    if ((e.target as HTMLElement).closest('[role="dialog"]') || 
        (e.target as HTMLElement).getAttribute('data-state') === 'open') {
      return;
    }
    
    // Don't toggle if clicking a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // Otherwise, allow opening from anywhere on the card
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    const card = document.getElementById(`team-card-${team.teamID}`);
    // Don't close if clicking dialog or its backdrop
    if ((e.target as HTMLElement).closest('[role="dialog"]') || 
        (e.target as HTMLElement).getAttribute('data-state') === 'open') {
      return;
    }
    
    if (card && !card.contains(e.target as Node)) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Calculate available width
  const isWide = sidebarWidth < 200; // Threshold for wide layout
  const showAbbreviation = sidebarWidth > 350; // Only show abbreviation on very wide sidebar

  // Get team colors
  const teamColors = getTeamColors(team.teamAbv);

  // Helper function to get display name
  const getTeamDisplayName = () => {
    if (showAbbreviation) {
      return team.teamAbv;
    }
    return isWide ? `${team.teamCity} ${team.teamName}` : team.teamName;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExpanded) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / (rect.height / 2)) * -3;

    setRotateX(rotateXValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
  };

  // Prepare data for charts
  const offensiveData = [
    { 
      category: 'Points', 
      value: parseFloat(team.ppg),
      percentile: 85, // This would ideally come from API
    },
    { 
      category: 'Assists', 
      value: parseFloat(team.offensiveStats.ast.Total),
      percentile: 75,
    },
    { 
      category: 'Rebounds', 
      value: parseFloat(team.offensiveStats.reb.Total),
      percentile: 80,
    },
  ];

  const defensiveData = [
    { 
      category: 'Points Allowed', 
      value: parseFloat(team.oppg),
      percentile: 82,
    },
    { 
      category: 'Blocks', 
      value: parseFloat(team.defensiveStats.blk.Total),
      percentile: 78,
    },
    { 
      category: 'Steals', 
      value: parseFloat(team.defensiveStats.stl.Total),
      percentile: 70,
    },
  ];

  // Helper function to format date string from "YYYYMMDD" to readable date
  function formatGameDate(dateString: string): string {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Function to determine if it's a home game and get opponent
  function getGameContext(game: GameSchedule, teamAbv: string) {
    const isHome = game.home === teamAbv;
    const opponent = isHome ? game.away : game.home;
    return {
      isHome,
      opponent,
      matchupText: isHome ? 'vs.' : '@'
    };
  }

  // Function to determine if a game is completed
  function isGameCompleted(gameTime: string): boolean {
    const gameDate = new Date(parseInt(gameTime) * 1000);
    return gameDate < new Date();
  }

  const renderGamePreview = (game: GameSchedule) => {
    const isCompleted = isGameCompleted(game.gameTime_epoch);
    const boxScore = isCompleted ? boxScores[game.gameID] : null;
    const opponent = game.home === team.teamAbv ? game.away : game.home;
    const isHome = game.home === team.teamAbv;
    const opponentTeam = allTeams.find(t => t.teamAbv === opponent);
    const gameDate = new Date(parseInt(game.gameTime_epoch) * 1000);

    return (
      <div key={game.gameID} className="relative">
        <GameStatsDialog 
          gameId={game.gameID}
          homeTeam={game.home}
          awayTeam={game.away}
        >
          <div className={cn(
            "flex items-center justify-between p-3 rounded-xl",
            "hover:bg-white/5 transition-colors cursor-pointer",
            "border border-transparent hover:border-white/10",
            "bg-gradient-to-r from-gray-800/70 to-gray-800/40",
            "backdrop-blur-sm"
          )}>
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-2">
                {/* Selected Team (Always First) */}
                <div className="flex items-center gap-1.5">
                  <Image
                    src={team.nbaComLogo1}
                    alt={team.teamAbv}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <span className="text-white/90 text-sm font-medium">
                    {team.teamAbv}
                  </span>
                </div>

                {/* Matchup Indicator */}
                <div className="flex items-center px-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-white/40" : "text-white/60"
                  )}>
                    {isHome ? 'vs' : '@'}
                  </span>
                </div>

                {/* Opponent Team (Always Second) */}
                <div className="flex items-center gap-1.5">
                  <Image
                    src={opponentTeam?.nbaComLogo1 || ''}
                    alt={opponent}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <span className="text-white/90 text-sm font-medium">
                    {opponent}
                  </span>
                </div>

                {/* Score (if completed) */}
                {isCompleted && boxScore && (
                  <div className="ml-3 flex items-center">
                    <span className="text-sm font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      {isHome ? (
                        <>
                          {boxScore.homePts} - {boxScore.awayPts}
                          <span className="ml-1.5 text-xs text-white/40">
                            {parseInt(boxScore.homePts) > parseInt(boxScore.awayPts) ? 'W' : 'L'}
                          </span>
                        </>
                      ) : (
                        <>
                          {boxScore.awayPts} - {boxScore.homePts}
                          <span className="ml-1.5 text-xs text-white/40">
                            {parseInt(boxScore.awayPts) > parseInt(boxScore.homePts) ? 'W' : 'L'}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isCompleted && (
                <div className="text-sm text-white/40">
                  {gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-1.5 py-0.5",
                  isCompleted 
                    ? "text-green-500 border-green-500/20 bg-green-500/10"
                    : "text-blue-500 border-blue-500/20 bg-blue-500/10"
                )}
              >
                {isCompleted ? 'Final' : 'Upcoming'}
              </Badge>
            </div>
          </div>
        </GameStatsDialog>
      </div>
    );
  };

  return (
    <motion.div
      layout
      className="w-full cursor-pointer"
      style={{
        perspective: "1500px",
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX: isExpanded ? 0 : rotateX,
        height: isExpanded ? 'auto' : '160px',
      }}
      transition={{
        layout: { type: "spring",
            stiffness: 300,
            damping: 30 },
        height: {type: "spring",
            stiffness: 300,
            damping: 30},
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        id={`team-card-${team.teamID}`}
        className={cn(
          "w-full overflow-hidden rounded-[24px] transform-gpu",
          "bg-gradient-to-r shadow-xl relative border-0",
          teamColors.gradientFrom,
          teamColors.gradientVia,
          teamColors.gradientTo,
          "hover:shadow-2xl hover:shadow-black/20",
          "transition-all duration-200 ease-linear"
        )}
        onClick={handleCardClick}
      >
        {/* Preview Section */}
        <div className="relative w-full h-32 sm:h-40 px-4 sm:px-6 flex items-center justify-between group">
          {/* Background Glow */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            "bg-gradient-to-r",
            teamColors.gradientFrom,
            teamColors.gradientVia,
            teamColors.gradientTo
          )} />

          {/* Team Logo Container */}
          <div className="absolute -left-8 sm:-left-12 top-1/2 -translate-y-1/2">
            <motion.div 
              className="relative w-32 h-32 sm:w-48 sm:h-48 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              initial={false}
            >
              <Image
                src={team.nbaComLogo1}
                alt={`${team.teamName} logo`}
                fill
                className="object-contain drop-shadow-2xl"
                style={{ filter: 'brightness(0.95)' }}
              />
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex items-center justify-between w-full pl-20 sm:pl-32">
            {/* Team Info */}
            <div>
              <motion.h2 
                className={cn(
                  "font-bold text-white mb-0.5 sm:mb-1",
                  isWide ? "text-xl sm:text-3xl" : "text-lg sm:text-2xl",
                  "truncate sm:text-clip"
                )}
                layout="position"
              >
                <span className={cn(
                  isWide ? "inline" : "hidden sm:inline"
                )}>
                  {team.teamCity}{' '}
                </span>
                {showAbbreviation ? team.teamAbv : team.teamName}
              </motion.h2>
              <motion.p 
                className={cn(
                  "text-white/80",
                  isWide ? "text-sm sm:text-base" : "text-xs sm:text-sm",
                  sidebarWidth > 300 ? "hidden" : "block"
                )}
                layout="position"
              >
                {team.conference} • {team.division}
              </motion.p>
              <motion.div 
                className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2"
                layout="position"
              >
                <span className={cn(
                  "font-bold text-white/90",
                  isWide ? "text-base sm:text-xl" : "text-sm sm:text-lg"
                )}>
                  {team.wins}-{team.loss}
                </span>
                <span className={cn(
                  "px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-medium",
                  isWide ? "text-xs sm:text-sm" : "text-xs",
                  team.currentStreak.result === 'W' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                )}>
                  {team.currentStreak.result}{team.currentStreak.length}
                </span>
              </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-4 sm:space-x-8 mr-2 sm:mr-8">
              <div className={cn(
                "text-center",
                isWide ? "block" : "hidden"
              )}>
                <p className="text-white/60 text-sm">PPG</p>
                <p className={cn(
                  "font-bold text-white",
                  isWide ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                )}>{parseFloat(team.ppg).toFixed(1)}</p>
              </div>
              <div className={cn(
                "text-center",
                sidebarWidth > 250 ? "block" : "hidden"
              )}>
                <p className="text-white/60 text-sm">OPPG</p>
                <p className={cn(
                  "font-bold text-white",
                  isWide ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                )}>{parseFloat(team.oppg).toFixed(1)}</p>
              </div>
              <motion.div 
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="text-white/80"
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "linear" }}
              className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={cn(
                    "relative p-3 sm:p-4 rounded-xl backdrop-blur-sm",
                    `bg-gradient-to-br ${teamColors.primary} ${teamColors.secondary} to-transparent`,
                    teamColors.borderColor,
                    `group ${teamColors.hoverGradientFrom} ${teamColors.hoverGradientVia} ${teamColors.hoverGradientTo}`,
                    "transition-all duration-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white/90">
                      Offensive Stats
                    </h3>
                    <div className="text-xs text-white/60">League Percentile</div>
                  </div>
                  <div className="space-y-3">
                    {offensiveData.map((stat) => (
                      <div key={stat.category} className="space-y-1">
                        <div className="flex justify-between text-sm text-white/80">
                          <span>{stat.category}</span>
                          <span className="font-mono">{stat.value.toFixed(1)}</span>
                        </div>
                        <div className="relative h-2 w-full bg-gray-950 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentile}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full",
                              "bg-gradient-to-r from-blue-500 to-blue-400",
                              "shadow-lg shadow-black/10"
                            )}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className={cn(
                    "relative p-3 sm:p-4 rounded-xl",
                    "bg-gradient-to-br from-${teamColors.secondary}-500/10 via-${teamColors.secondary}-400/5 to-transparent",
                    `border-${teamColors.secondary}-500/20`,
                    `group hover:from-${teamColors.secondary}-500/20 hover:via-${teamColors.secondary}-400/10 hover:to-transparent`,
                    "transition-all duration-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white/90">
                      Defensive Stats
                    </h3>
                    <div className="text-xs text-white/60">League Percentile</div>
                  </div>
                  <div className="space-y-3">
                    {defensiveData.map((stat) => (
                      <div key={stat.category} className="space-y-1">
                        <div className="flex justify-between text-sm text-white/80">
                          <span>{stat.category}</span>
                          <span className="font-mono">{stat.value.toFixed(1)}</span>
                        </div>
                        <div className="relative h-2 w-full bg-gray-950 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentile}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full",
                              "bg-gradient-to-r from-indigo-500 to-indigo-400",
                              "shadow-lg shadow-black/10"
                            )}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Top Performers */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2, ease: "linear" }}
                className={cn(
                  "p-4 sm:p-6 rounded-2xl",
                  "bg-gradient-to-br from-gray-900/80 to-gray-900/40",
                  "backdrop-blur-md border border-white/5"
                )}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-white/90 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Top Performers</span>
                </h3>
                <div className="flex flex-col gap-3">
                  {Object.entries(team.topPerformers).map(([category, data]: [string, { total: string; playerID: string[] }], index) => {
                    const Icon = index === 0 ? Star : index === 1 ? Target : Trophy;
                    const statInfo = statDescriptions[category];
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        )}
                      >
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm font-medium text-white/80">{statInfo?.full || category}</div>
                          <div className="text-xs text-white/60">{statInfo?.description || `${category.toUpperCase()} per game`}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-white">{data.total}</div>
                          <div className="flex -space-x-2">
                            {data.playerID.map((playerId) => {
                              const player = team.Roster[playerId];
                              if (!player) return null;
                              return (
                                <TooltipProvider key={playerId}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="first:ml-0 hover:translate-y-[-2px] transition-transform duration-200">
                                        <PlayerAvatar
                                          player={player}
                                          size="sm"
                                          className="border-2 border-gray-900 hover:border-white/20 transition-colors duration-200"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-medium">{player.longName}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recent Games */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2, ease: "linear" }}
                className={cn(
                  "p-4 sm:p-6 rounded-2xl",
                  "bg-gradient-to-br from-gray-900/90 to-gray-900/50",
                  "backdrop-blur-md border border-white/10",
                  "shadow-xl shadow-black/20"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white/90">Recent Games</h3>
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                    <button
                      onClick={() => setGameFilter('upcoming')}
                      className={cn(
                        "px-3 py-1 rounded-md text-sm font-medium transition-all duration-200",
                        gameFilter === 'upcoming' 
                          ? "bg-white/10 text-white" 
                          : "text-white/60 hover:text-white/80"
                      )}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setGameFilter('completed')}
                      className={cn(
                        "px-3 py-1 rounded-md text-sm font-medium transition-all duration-200",
                        gameFilter === 'completed' 
                          ? "bg-white/10 text-white" 
                          : "text-white/60 hover:text-white/80"
                      )}
                    >
                      Completed
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {Object.entries(team.teamSchedule || {})
                    .filter(([_, game]) => {
                      const completed = isGameCompleted(game.gameTime_epoch);
                      return gameFilter === 'completed' ? completed : !completed;
                    })
                    .map(([_, game]) => renderGamePreview(game))}
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
