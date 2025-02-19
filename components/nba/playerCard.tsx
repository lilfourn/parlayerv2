'use client';

import { Card } from '@/components/ui/card';
import { Player, PlayerStats, ParsedPlayerGameStats } from '@/types/nba';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Trophy, Star, Target, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Add team colors mapping
const teamColors: Record<string, { primary: string; secondary: string }> = {
  ATL: { primary: '#E03A3E', secondary: '#C1D32F' },
  BOS: { primary: '#007A33', secondary: '#BA9653' },
  BKN: { primary: '#000000', secondary: '#FFFFFF' },
  CHA: { primary: '#1D1160', secondary: '#00788C' },
  CHI: { primary: '#CE1141', secondary: '#000000' },
  CLE: { primary: '#860038', secondary: '#041E42' },
  DAL: { primary: '#00538C', secondary: '#002B5E' },
  DEN: { primary: '#0E2240', secondary: '#FEC524' },
  DET: { primary: '#C8102E', secondary: '#1D42BA' },
  GSW: { primary: '#1D428A', secondary: '#FFC72C' },
  HOU: { primary: '#CE1141', secondary: '#000000' },
  IND: { primary: '#002D62', secondary: '#FDBB30' },
  LAC: { primary: '#C8102E', secondary: '#1D428A' },
  LAL: { primary: '#552583', secondary: '#FDB927' },
  MEM: { primary: '#5D76A9', secondary: '#12173F' },
  MIA: { primary: '#98002E', secondary: '#F9A01B' },
  MIL: { primary: '#00471B', secondary: '#EEE1C6' },
  MIN: { primary: '#0C2340', secondary: '#236192' },
  NOP: { primary: '#0C2340', secondary: '#C8102E' },
  NYK: { primary: '#006BB6', secondary: '#F58426' },
  OKC: { primary: '#007AC1', secondary: '#EF3B24' },
  ORL: { primary: '#0077C0', secondary: '#C4CED4' },
  PHI: { primary: '#006BB6', secondary: '#ED174C' },
  PHX: { primary: '#1D1160', secondary: '#E56020' },
  PHO: { primary: '#1D1160', secondary: '#E56020' },
  POR: { primary: '#E03A3E', secondary: '#000000' },
  SAC: { primary: '#5A2D81', secondary: '#63727A' },
  SAS: { primary: '#C4CED4', secondary: '#000000' },
  TOR: { primary: '#CE1141', secondary: '#000000' },
  UTA: { primary: '#002B5C', secondary: '#00471B' },
  WAS: { primary: '#002B5C', secondary: '#E31837' },
};

function parseStatValue(value: string | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

interface PlayerCardProps {
  player: Player;
  sidebarWidth?: number;
  maxStats?: {
    pts: number;
    ast: number;
    reb: number;
    stl: number;
    blk: number;
  };
}

interface StatDisplay {
  label: string;
  key: keyof PlayerStats;
  format: (value: string | number) => string;
}

const playerStatDisplays: StatDisplay[] = [
  { label: "PPG", key: "pts", format: (v) => Number(v).toFixed(1) },
  { label: "RPG", key: "reb", format: (v) => Number(v).toFixed(1) },
  { label: "APG", key: "ast", format: (v) => Number(v).toFixed(1) },
  { label: "FG%", key: "fgp", format: (v) => `${Number(v).toFixed(1)}%` },
  { label: "3P%", key: "tptfgp", format: (v) => `${Number(v).toFixed(1)}%` },
];

const advancedStatDisplays: StatDisplay[] = [
  { label: "Minutes", key: "mins", format: (v) => Number(v).toFixed(1) },
  { label: "Blocks", key: "blk", format: (v) => Number(v).toFixed(1) },
  { label: "Steals", key: "stl", format: (v) => Number(v).toFixed(1) },
  { label: "TOV", key: "TOV", format: (v) => Number(v).toFixed(1) },
  { label: "Usage", key: "usage", format: (v) => `${Number(v).toFixed(1)}%` },
];

function formatHeight(height: string | undefined) {
  if (!height) return '';
  const [feet, inches] = height.split('-').map(Number);
  return `${feet}'${inches}"`;
}

export function PlayerCard({ player, sidebarWidth = 350, maxStats }: PlayerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statsData = [
    { name: 'PTS', value: parseStatValue(player.stats?.pts), maxValue: maxStats?.pts || 35 },
    { name: 'AST', value: parseStatValue(player.stats?.ast), maxValue: maxStats?.ast || 12 },
    { name: 'REB', value: parseStatValue(player.stats?.reb), maxValue: maxStats?.reb || 15 },
    { name: 'STL', value: parseStatValue(player.stats?.stl), maxValue: maxStats?.stl || 3 },
    { name: 'BLK', value: parseStatValue(player.stats?.blk), maxValue: maxStats?.blk || 3 },
  ];

  const statData = player.stats ? playerStatDisplays.map(stat => ({
    name: stat.label,
    value: stat.format(player.stats[stat.key])
  })) : [];

  const advancedData = player.stats ? advancedStatDisplays.map(stat => ({
    name: stat.label,
    value: stat.format(player.stats[stat.key])
  })) : [];

  const nameParts = player.longName?.split(' ') || [];
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');

  const teamColor = teamColors[player.team] || { primary: '#000000', secondary: '#FFFFFF' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full"
    >
      <Card
        className={cn(
          "relative w-full overflow-hidden group hover:shadow-lg border-0",
          isExpanded ? "h-auto" : "h-[180px]"
        )}
        style={{
          background: `linear-gradient(135deg, 
            ${teamColor.primary}15 0%, 
            ${teamColor.secondary}15 100%)`
        }}
      >
        {/* Team Logo Backdrop */}
        <div 
          className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none"
          style={{
            backgroundImage: `url(https://cdn.nba.com/logos/nba/${player.teamID}/global/L/logo.svg)`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '60%',
            filter: 'brightness(1.5)'
          }}
        />

        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${teamColor.primary}25 0%, ${teamColor.secondary}25 100%)`
          }}
        />

        <motion.div
          className="relative p-4 space-y-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          layout
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 shrink-0" style={{ borderColor: teamColor.primary }}>
                <AvatarImage src={player.nbaComHeadshot || player.espnHeadshot} alt={`${firstName} ${lastName}`} className="object-cover" />
                <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg text-white/90">
                  {firstName} {lastName}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs text-white"
                    style={{
                      backgroundColor: `${teamColor.primary}30`
                    }}
                  >
                    {player.team}
                  </Badge>
                  <span className="text-sm text-slate-400">
                    {player.pos} • #{player.jerseyNum}
                  </span>
                </div>
              </div>
            </div>
            <button 
              className="text-slate-400 hover:text-slate-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {/* Basic Stats Section */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {playerStatDisplays.map((stat, index) => (
              <TooltipProvider key={stat.key}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-slate-800/50">
                      <span className="text-xs text-slate-400">{stat.label}</span>
                      <span className="text-lg font-semibold text-slate-100">
                        {player.stats ? stat.format(player.stats[stat.key]) : '-'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stat.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Expanded Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  duration: 0.5,
                  bounce: 0.1
                }}
                className="overflow-hidden"
              >
                {/* Player Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Height</div>
                    <div className="text-slate-100">{formatHeight(player.height)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Weight</div>
                    <div className="text-slate-100">{player.weight} lbs</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">College</div>
                    <div className="text-slate-100">{player.college || 'N/A'}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Experience</div>
                    <div className="text-slate-100">{player.exp} years</div>
                  </div>
                </div>

                {/* Advanced Stats Section */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {advancedStatDisplays.map((stat, index) => (
                    <TooltipProvider key={stat.key}>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-800/50">
                            <span className="text-xs text-slate-400">{stat.label}</span>
                            <span className="text-lg font-semibold text-slate-100">
                              {player.stats ? stat.format(player.stats[stat.key]) : '-'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{stat.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>

                {/* Stats Bar Chart */}
                <div className="mt-4 space-y-2">
                  {statsData.map((stat) => (
                    <div key={stat.name} className="flex items-center gap-2">
                      <div className="w-8 text-sm font-medium text-slate-400">{stat.name}</div>
                      <div className="flex-1 h-2 bg-gray-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          style={{
                            width: `${(stat.value / stat.maxValue) * 100}%`
                          }}
                        />
                      </div>
                      <div className="w-8 text-sm text-slate-400 text-right">
                        {stat.value.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Injury Information */}
                {player.injury && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <h4 className="text-sm font-medium text-red-400 mb-2">Injury Status</h4>
                    <div className="text-sm text-slate-300">{player.injury.description}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Return Date: {player.injury.injReturnDate || 'Unknown'}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Card>
    </motion.div>
  );
}