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
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GameStat {
  id: number
  gameId: string
  date: string
  playerId: string
  blocks: number
  offRebounds: number
  defRebounds: number
  rebounds: number
  assists: number
  steals: number
  points: number
  technicals: number
  team: string
  turnovers: number
  fgAttempted: number
  fgMade: number
  fgPercentage: number
  threePtMade: number
  threePtAttempted: number
  threePtPercentage: number
  minutes: number
  teamId: string
  personalFouls: number
  ftMade: number
  ftAttempted: number
}

interface PlayerDialogProps {
  playerName: string
  trigger?: React.ReactNode
  combo?: boolean
}

async function fetchPlayerStats(playerName: string): Promise<GameStat[]> {
  const response = await fetch(`/api/nba/playerStats/db?playerName=${encodeURIComponent(playerName)}`)
  if (!response.ok) {
    throw new Error('Failed to fetch player stats')
  }
  return response.json()
}

function StatsTable({ stats }: { stats: GameStat[] }) {
  const sortedGameStats = stats.sort((a, b) => b.gameId.localeCompare(a.gameId))

  return (
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedGameStats.map((game) => (
          <TableRow 
            key={game.id}
            className="border-b border-gray-800/60 hover:bg-gray-800/50 transition-colors"
          >
            <TableCell className="text-gray-300">{game.date}</TableCell>
            <TableCell className="text-gray-300">{game.team}</TableCell>
            <TableCell className="text-gray-300">{game.minutes}</TableCell>
            <TableCell className="font-medium text-gray-200">{game.points}</TableCell>
            <TableCell className="text-gray-300">{game.rebounds}</TableCell>
            <TableCell className="text-gray-300">{game.assists}</TableCell>
            <TableCell className="text-gray-300">{game.steals}</TableCell>
            <TableCell className="text-gray-300">{game.blocks}</TableCell>
            <TableCell className="text-gray-300">{game.turnovers}</TableCell>
            <TableCell className="text-gray-300">{`${game.fgMade}/${game.fgAttempted}`}</TableCell>
            <TableCell className="text-gray-300">{`${game.threePtMade}/${game.threePtAttempted}`}</TableCell>
            <TableCell className="text-gray-300">{`${game.ftMade}/${game.ftAttempted}`}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function PlayerDialog({ playerName, trigger, combo = false }: PlayerDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playerStats, setPlayerStats] = useState<{ [key: string]: GameStat[] }>({})
  const [activeTab, setActiveTab] = useState<string>('combined')

  useEffect(() => {
    if (isOpen && playerName) {
      const loadPlayerStats = async () => {
        try {
          setIsLoading(true)
          setError(null)
          
          if (combo) {
            const playerNames = playerName.split('+').map(name => name.trim())
            const stats: { [key: string]: GameStat[] } = {}
            
            for (const name of playerNames) {
              const playerStats = await fetchPlayerStats(name)
              stats[name] = playerStats
            }
            
            setPlayerStats(stats)
          } else {
            const stats = await fetchPlayerStats(playerName)
            setPlayerStats({ [playerName]: stats })
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load player stats')
        } finally {
          setIsLoading(false)
        }
      }

      loadPlayerStats()
    }
  }, [isOpen, playerName, combo])

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
            {combo ? (
              <Tabs defaultValue="combined" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 mb-4">
                  <TabsTrigger value="combined" className="data-[state=active]:bg-gray-700">Combined Stats</TabsTrigger>
                  {Object.keys(playerStats).map((name) => (
                    <TabsTrigger 
                      key={name} 
                      value={name}
                      className="data-[state=active]:bg-gray-700"
                    >
                      {name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="combined">
                  <StatsTable 
                    stats={Object.values(playerStats)
                      .flat()
                      .sort((a, b) => b.gameId.localeCompare(a.gameId))} 
                  />
                </TabsContent>
                {Object.entries(playerStats).map(([name, stats]) => (
                  <TabsContent key={name} value={name}>
                    <StatsTable stats={stats} />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <StatsTable stats={Object.values(playerStats)[0] || []} />
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}