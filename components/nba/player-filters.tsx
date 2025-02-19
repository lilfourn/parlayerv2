'use client';

import { NBATeam } from '@/types/nba';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Filter } from 'lucide-react';

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
    <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
      <div className="flex items-center gap-2 text-slate-300 mb-2">
        <Filter size={20} />
        <h3 className="font-medium">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search players..."
            className="pl-8 bg-gray-900/50"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Team Filter */}
        <Select
          value={selectedTeam}
          onValueChange={onTeamChange}
        >
          <SelectTrigger className="bg-gray-900/50">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {sortedTeams.map((team) => (
              <SelectItem key={team.teamID} value={team.teamAbv}>
                {team.teamCity} {team.teamName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Top Players Toggle */}
        <div className="flex items-center justify-end space-x-2">
          <Label htmlFor="top-players" className="text-slate-300">
            Show Top Players Only
          </Label>
          <Switch
            id="top-players"
            checked={showTopPlayersOnly}
            onCheckedChange={onShowTopPlayersChange}
          />
        </div>
      </div>
    </div>
  );
}
