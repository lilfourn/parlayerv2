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
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{playerName} - Season Stats</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ScrollArea className="h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>MIN</TableHead>
                  <TableHead>PTS</TableHead>
                  <TableHead>REB</TableHead>
                  <TableHead>AST</TableHead>
                  <TableHead>STL</TableHead>
                  <TableHead>BLK</TableHead>
                  <TableHead>TO</TableHead>
                  <TableHead>FG</TableHead>
                  <TableHead>3PT</TableHead>
                  <TableHead>FT</TableHead>
                  <TableHead>+/-</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gameStats.map(([gameId, game]) => (
                  <TableRow key={gameId}>
                    <TableCell>{gameId.split('_')[0]}</TableCell>
                    <TableCell>{game.teamAbv}</TableCell>
                    <TableCell>{game.mins}</TableCell>
                    <TableCell>{game.pts}</TableCell>
                    <TableCell>{game.reb}</TableCell>
                    <TableCell>{game.ast}</TableCell>
                    <TableCell>{game.stl}</TableCell>
                    <TableCell>{game.blk}</TableCell>
                    <TableCell>{game.TOV}</TableCell>
                    <TableCell>{`${game.fgm}/${game.fga}`}</TableCell>
                    <TableCell>{`${game.tptfgm}/${game.tptfga}`}</TableCell>
                    <TableCell>{`${game.ftm}/${game.fta}`}</TableCell>
                    <TableCell>{game.plusMinus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}