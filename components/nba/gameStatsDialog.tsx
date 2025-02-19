'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayerAvatar } from './playerAvatar';
import { BoxScoreResponse, PlayerGameStats, GAME_STATUS, GAME_STATUS_TEXT, GameStatusCode } from '@/types/nba';
import { Loader2, Calendar, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameStatsDialogProps {
  gameId: string;
  children: React.ReactNode;
  homeTeam: string;
  awayTeam: string;
}

interface PlayerHeadshot {
  playerId: string;
  headshotUrl: string | null;
  nbaComHeadshot?: string;
  espnHeadshot?: string;
}

export function GameStatsDialog({ gameId, children, homeTeam, awayTeam }: GameStatsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [boxScore, setBoxScore] = useState<BoxScoreResponse['body'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerHeadshots, setPlayerHeadshots] = useState<Record<string, PlayerHeadshot>>({});

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const fetchGameStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/nba/boxScores?gameIds=${gameId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch game stats');
      }

      setBoxScore(data.data[gameId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game stats');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHeadshots = async () => {
    try {
      const playerIds = Object.values(boxScore?.playerStats || {}).map(player => player.playerID);
      const response = await fetch(`/api/nba/playerInfo?playerIds=${playerIds.join(',')}`);
      const data = await response.json();
      
      if (data.success) {
        // Create a map of playerID to headshot URLs
        const headshotMap = data.data.reduce((acc: Record<string, PlayerHeadshot>, player: any) => {
          acc[player.playerID] = {
            playerId: player.playerID,
            headshotUrl: player.headshotUrl || null,
            nbaComHeadshot: player.nbaComHeadshot,
            espnHeadshot: player.espnHeadshot
          };
          return acc;
        }, {});
        setPlayerHeadshots(headshotMap);
      }
    } catch (error) {
      console.error('Error fetching player headshots:', error);
    }
  };

  useEffect(() => {
    if (boxScore?.playerStats) {
      fetchHeadshots();
    }
  }, [boxScore]);

  const formatStat = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toFixed(1);
  };

  const getStatusColor = (status: GameStatusCode) => {
    switch (status) {
      case GAME_STATUS.IN_PROGRESS:
        return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case GAME_STATUS.COMPLETED:
        return "text-green-500 border-green-500/20 bg-green-500/10";
      case GAME_STATUS.POSTPONED:
      case GAME_STATUS.SUSPENDED:
        return "text-red-500 border-red-500/20 bg-red-500/10";
      default:
        return "text-blue-500 border-blue-500/20 bg-blue-500/10";
    }
  };

  const renderGameStatus = () => {
    if (!boxScore) return null;

    const statusCode = boxScore.gameStatusCode as GameStatusCode;
    const statusText = GAME_STATUS_TEXT[statusCode];
    const colorClasses = getStatusColor(statusCode);

    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs font-medium px-2 py-0.5",
          colorClasses
        )}
      >
        {statusText}
      </Badge>
    );
  };

  const renderUpcomingGame = () => (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
      <div className="text-white/40 flex flex-col items-center gap-2">
        <Calendar className="h-12 w-12" />
        <p className="text-lg">Game hasn't started yet</p>
        <p className="text-sm text-white/30">Check back during or after the game for stats</p>
      </div>
    </div>
  );

  const renderPlayerStats = (players: Record<string, PlayerGameStats>, teamAbv: string) => {
    return Object.values(players)
      .filter(player => player.teamAbv === teamAbv)
      .sort((a, b) => parseFloat(b.pts) - parseFloat(a.pts))
      .map(player => {
        // Create a proper short name from the player's full name
        const nameParts = player.longName.split(' ');
        const shortName = nameParts.length > 1 
          ? `${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`
          : player.longName;
        
        // Get headshot URLs from our cached state
        const headshots = playerHeadshots[player.playerID] || {};
        
        return (
          <div 
            key={player.playerID} 
            className={cn(
              "flex items-center space-x-4 p-3",
              "rounded-xl transition-all duration-200",
              "hover:bg-white/5 border border-transparent",
              "hover:border-white/10 backdrop-blur-sm",
              "cursor-pointer"
            )}
          >
            <PlayerAvatar
              player={{
                playerID: player.playerID,
                shortName,
                longName: player.longName,
                headshotUrl: headshots.headshotUrl || undefined,
                nbaComHeadshot: headshots.nbaComHeadshot,
                espnHeadshot: headshots.espnHeadshot
              }}
              size="md"
              className="rounded-xl border border-white/10"
            />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-white/90">{player.longName}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/70 font-medium">
                  {player.pts} PTS
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{player.reb} REB</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{player.ast} AST</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{formatStat(player.mins)} MIN</span>
              </div>
            </div>
          </div>
        );
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div onClick={fetchGameStats} className="cursor-pointer">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent 
        className={cn(
          "sm:max-w-[600px] border-0",
          "bg-gradient-to-br from-gray-900/90 to-gray-800/90",
          "backdrop-blur-md shadow-xl",
          "p-0 overflow-hidden"
        )}
      >
        <div className="relative">
          {/* Header with gradient */}
          <div className={cn(
            "p-6 pb-4",
            "bg-black/20",
            "border-b border-white/10"
          )}>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogClose className="rounded-full h-6 w-6 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4 text-white/70" />
                </DialogClose>
                <DialogTitle className="text-center space-y-3 flex-1">
                  <div className="flex items-center justify-center gap-4 text-xl font-bold text-white">
                    <span>{awayTeam}</span>
                    <span className="text-white/40">vs</span>
                    <span>{homeTeam}</span>
                  </div>
                  {boxScore && (
                    <div className="flex items-center justify-center gap-3">
                      {boxScore.gameStatusCode === GAME_STATUS.COMPLETED && (
                        <div className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                          {boxScore.awayPts} - {boxScore.homePts}
                        </div>
                      )}
                      {renderGameStatus()}
                    </div>
                  )}
                </DialogTitle>
              </div>
            </DialogHeader>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-[400px] text-white/40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[400px] text-red-400 p-4">
              {error}
            </div>
          ) : boxScore ? (
            boxScore.gameStatusCode === GAME_STATUS.NOT_STARTED ? (
              renderUpcomingGame()
            ) : (
              <div className="p-4">
                <Tabs 
                  defaultValue={awayTeam} 
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-2 bg-white/5 p-1 rounded-lg">
                    <TabsTrigger 
                      value={awayTeam}
                      className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white"
                    >
                      {awayTeam}
                    </TabsTrigger>
                    <TabsTrigger 
                      value={homeTeam}
                      className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white"
                    >
                      {homeTeam}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={awayTeam}>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-1">
                        {renderPlayerStats(boxScore.playerStats, awayTeam)}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value={homeTeam}>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-1">
                        {renderPlayerStats(boxScore.playerStats, homeTeam)}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            )
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
