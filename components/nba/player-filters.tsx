'use client';

import { NBATeam } from '@/types/nba';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PlayerFiltersProps {
  teams: NBATeam[];
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  showTopPlayersOnly: boolean;
  onShowTopPlayersChange: (show: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PlayerFilters({
  teams,
  selectedTeam,
  onTeamChange,
  showTopPlayersOnly,
  onShowTopPlayersChange,
  searchQuery,
  onSearchChange,
}: PlayerFiltersProps) {
  const sortedTeams = [...teams].sort((a, b) => parseInt(b.wins) - parseInt(a.wins));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative p-6 rounded-2xl space-y-6",
        "bg-gradient-to-br from-gray-900/90 to-gray-900/50",
        "backdrop-blur-md border border-white/10",
        "shadow-xl shadow-black/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white/80">
          <Users size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Player Filters
          </h3>
          <p className="text-sm text-white/40">
            Customize your player view
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white/60 transition-colors" />
          <Input
            placeholder="Search players..."
            className={cn(
              "pl-10 h-11 bg-white/5 border-white/5",
              "focus:bg-white/10 focus:border-white/10",
              "placeholder:text-white/40",
              "text-white/80",
              "transition-colors"
            )}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Team Filter */}
        <Select
          value={selectedTeam}
          onValueChange={onTeamChange}
        >
          <SelectTrigger className={cn(
            "h-11 bg-white/5 border-white/5",
            "hover:bg-white/10 hover:border-white/10",
            "focus:bg-white/10 focus:border-white/10",
            "text-white/80"
          )}>
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/10 text-white/80">
            <SelectItem value="all" className="focus:bg-white/10">All Teams</SelectItem>
            {sortedTeams.map((team) => (
              <SelectItem 
                key={team.teamID} 
                value={team.teamAbv}
                className="focus:bg-white/10"
              >
                {team.teamCity} {team.teamName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Top Players Toggle */}
        <div className="flex items-center justify-end space-x-3 px-2">
          <Label 
            htmlFor="top-players" 
            className="text-white/60 text-sm cursor-pointer hover:text-white/80 transition-colors"
          >
            Top Players Only
          </Label>
          <Switch
            id="top-players"
            checked={showTopPlayersOnly}
            onCheckedChange={onShowTopPlayersChange}
            className={cn(
              "data-[state=checked]:bg-purple-600",
              "data-[state=checked]:shadow-[0_0_12px_0_rgb(147,51,234,0.7)]",
              "transition-all duration-200"
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}
