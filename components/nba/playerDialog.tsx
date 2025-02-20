"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {cn} from "@/lib/utils"

interface PlayerGameStats {
  blk: string
  OffReb: string
  ftp: string
  DefReb: string
  plusMinus: string
  stl: string
  pts: string
  tech: string
  team: string
  TOV: string
  fga: string
  ast: string
  tptfgp: string
  teamAbv: string
  mins: string
  fgm: string
  fgp: string
  reb: string
  teamID: string
  tptfgm: string
  fta: string
  tptfga: string
  longName: string
  PF: string
  playerID: string
  ftm: string
  gameID: string
  fantasyPoints: string
}

interface PlayerStats {
  body: {
    [gameId: string]: PlayerGameStats
  }
}

interface SimplifiedNBAPlayer {
  longName: string
  team: string
  playerID: string
}

interface PlayerDialogProps {
  playerName: string
  trigger?: React.ReactNode
}

async function fetchPlayerList(): Promise<SimplifiedNBAPlayer[]> {
  const response = await fetch('/api/nba/playerStats/playerList')
  if (!response.ok) {
    throw new Error('Failed to fetch player list')
  }
  return response.json()
}

async function fetchPlayerStats(playerID: string): Promise<PlayerStats> {
  const response = await fetch(`/api/nba/playerStats?playerIDs=${playerID}`)
  if (!response.ok) {
    throw new Error('Failed to fetch player stats')
  }
  const data = await response.json()
  return data[playerID]
}

export function PlayerDialog({ playerName, trigger }: PlayerDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)

  useEffect(() => {
    if (isOpen && playerName) {
      const loadPlayerStats = async () => {
        try {
          setIsLoading(true)
          setError(null)
          
          // First, get the player list and find the matching player
          const players = await fetchPlayerList()
          const player = players.find(p => p.longName === playerName)
          
          if (!player) {
            throw new Error('Player not found')
          }

          // Then fetch the player's stats
          const stats = await fetchPlayerStats(player.playerID)
          setPlayerStats(stats)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load player stats')
        } finally {
          setIsLoading(false)
        }
      }

      loadPlayerStats()
    }
  }, [isOpen, playerName])

  const gameStats = playerStats ? Object.entries(playerStats.body).sort((a, b) => {
    // Sort by game date (gameID format: YYYYMMDD_AWAY@HOME)
    return b[0].localeCompare(a[0])
  }) : []

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="ghost">View Stats</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900/95 backdrop-blur-sm border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            {playerName} - Season Stats
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gray-800" />
            <Skeleton className="h-4 w-full bg-gray-800" />
            <Skeleton className="h-4 w-full bg-gray-800" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            <Table>
              <TableHeader className="bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-10">
                <TableRow className="border-b border-gray-800">
                  <TableHead className="text-gray-200 font-semibold">Date</TableHead>
                  <TableHead className="text-gray-200 font-semibold">Team</TableHead>
                  <TableHead className="text-gray-200 font-semibold">MIN</TableHead>
                  <TableHead className="text-gray-200 font-semibold">PTS</TableHead>
                  <TableHead className="text-gray-200 font-semibold">REB</TableHead>
                  <TableHead className="text-gray-200 font-semibold">AST</TableHead>
                  <TableHead className="text-gray-200 font-semibold">STL</TableHead>
                  <TableHead className="text-gray-200 font-semibold">BLK</TableHead>
                  <TableHead className="text-gray-200 font-semibold">TO</TableHead>
                  <TableHead className="text-gray-200 font-semibold">FG</TableHead>
                  <TableHead className="text-gray-200 font-semibold">3PT</TableHead>
                  <TableHead className="text-gray-200 font-semibold">FT</TableHead>
                  <TableHead className="text-gray-200 font-semibold">+/-</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gameStats.map(([gameId, game]) => {
                  const plusMinus = parseInt(game.plusMinus);
                  return (
                    <TableRow 
                      key={gameId}
                      className="border-b border-gray-800/60 hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="text-gray-300">{gameId.split('_')[0]}</TableCell>
                      <TableCell className="text-gray-300">{game.teamAbv}</TableCell>
                      <TableCell className="text-gray-300">{game.mins}</TableCell>
                      <TableCell className="font-medium text-gray-200">{game.pts}</TableCell>
                      <TableCell className="text-gray-300">{game.reb}</TableCell>
                      <TableCell className="text-gray-300">{game.ast}</TableCell>
                      <TableCell className="text-gray-300">{game.stl}</TableCell>
                      <TableCell className="text-gray-300">{game.blk}</TableCell>
                      <TableCell className="text-gray-300">{game.TOV}</TableCell>
                      <TableCell className="text-gray-300">{`${game.fgm}/${game.fga}`}</TableCell>
                      <TableCell className="text-gray-300">{`${game.tptfgm}/${game.tptfga}`}</TableCell>
                      <TableCell className="text-gray-300">{`${game.ftm}/${game.fta}`}</TableCell>
                      <TableCell className={cn(
                        plusMinus > 0 ? "text-green-400" : plusMinus < 0 ? "text-red-400" : "text-gray-400"
                      )}>
                        {plusMinus > 0 ? `+${game.plusMinus}` : game.plusMinus}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}