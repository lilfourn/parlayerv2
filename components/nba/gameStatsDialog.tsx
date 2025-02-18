'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BoxScoreResponse, PlayerGameStats } from '@/types/nba';
import { Loader2 } from 'lucide-react';

interface GameStatsDialogProps {
  gameId: string;
  children: React.ReactNode;
  homeTeam: string;
  awayTeam: string;
}

export function GameStatsDialog({ gameId, children, homeTeam, awayTeam }: GameStatsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [boxScore, setBoxScore] = useState<BoxScoreResponse['body'] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const formatStat = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toFixed(1);
  };

  const renderPlayerStats = (players: Record<string, PlayerGameStats>, teamAbv: string) => {
    return Object.values(players)
      .filter(player => player.teamAbv === teamAbv)
      .sort((a, b) => parseFloat(b.pts) - parseFloat(a.pts))
      .map(player => (
        <div key={player.playerID} className="flex items-center space-x-4 p-2 hover:bg-accent rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${player.playerID}.png`} />
            <AvatarFallback>{player.longName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{player.longName}</p>
            <div className="flex space-x-2 text-xs text-muted-foreground">
              <span>{player.pts}pts</span>
              <span>{player.reb}reb</span>
              <span>{player.ast}ast</span>
              <span>{formatStat(player.mins)}min</span>
            </div>
          </div>
        </div>
      ));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div onClick={fetchGameStats} className="cursor-pointer">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center space-x-2">
            <span>{awayTeam}</span>
            <span>vs</span>
            <span>{homeTeam}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive p-4">
            {error}
          </div>
        ) : boxScore ? (
          <div className="mt-4">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold">
                {boxScore.awayPts} - {boxScore.homePts}
              </div>
              <Badge variant="secondary" className="mt-2">
                {boxScore.gameStatus}
              </Badge>
            </div>

            <Tabs defaultValue={awayTeam} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={awayTeam}>{awayTeam}</TabsTrigger>
                <TabsTrigger value={homeTeam}>{homeTeam}</TabsTrigger>
              </TabsList>
              <TabsContent value={awayTeam}>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  {renderPlayerStats(boxScore.playerStats, awayTeam)}
                </ScrollArea>
              </TabsContent>
              <TabsContent value={homeTeam}>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  {renderPlayerStats(boxScore.playerStats, homeTeam)}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
