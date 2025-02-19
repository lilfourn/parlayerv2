"use client"

import { useEffect, useMemo } from "react"
import { ProjectionWithAttributes } from "@/types/projections"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpIcon, ArrowDownIcon, FilterIcon, RefreshCw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useNBAStore } from "@/store/nba-store"
import { useState } from "react"
import {cn} from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LineMovementToast } from "./line-movement-toast"

interface ProjectionTableProps {
  className?: string
}

// NBA League IDs mapping
const NBA_LEAGUE_IDS = {
  NBA: 7,
  NBA_PRESEASON: 18,
  NBA_SECOND_HALF: 80,
  NBA_FIRST_HALF: 84,
  NBA_FOURTH_QUARTER: 149,
  NBA_GENERAL: 158,
  NBA_FUTURES: 173
} as const

// Create a type for valid league IDs
type NBALeagueId = typeof NBA_LEAGUE_IDS[keyof typeof NBA_LEAGUE_IDS]

// Create an array of valid league IDs
const VALID_LEAGUE_IDS: NBALeagueId[] = Object.values(NBA_LEAGUE_IDS)

export function ProjectionTable({ className }: ProjectionTableProps) {
  const [selectedStatType, setSelectedStatType] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { 
    projections, 
    isLoadingProjections, 
    error, 
    loadProjections,
    lastProjectionsUpdate,
    calculateLineMovements
  } = useNBAStore()

  // Initial load
  useEffect(() => {
    // Only load if we don't have projections and aren't already loading
    if (!isLoadingProjections) {
      loadProjections()
    }
  }, [loadProjections, isLoadingProjections])

  // Set up hourly refresh interval
  useEffect(() => {
    const interval = setInterval(loadProjections, 3600000)
    return () => clearInterval(interval)
  }, [loadProjections])

  // Filter projections for NBA leagues and calculate line movements
  const nbaProjections = useMemo(() => 
    projections.filter(proj => {
      const leagueId = proj.player?.attributes.league_id
      return leagueId && VALID_LEAGUE_IDS.includes(leagueId as NBALeagueId)
    })
  , [projections])

  // Calculate line movements for NBA projections
  const lineMovements = useMemo(() => 
    calculateLineMovements(nbaProjections)
  , [nbaProjections, calculateLineMovements])

  // Extract unique stat types from NBA projections
  const statTypes = useMemo(() => {
    const types = new Set<string>()
    nbaProjections.forEach((proj) => {
      const statType = proj.projection.attributes.stat_display_name
      if (statType) types.add(statType)
    })
    return Array.from(types).sort()
  }, [nbaProjections])

  // Filter projections by selected stat type
  const filteredProjections = useMemo(() => 
    selectedStatType === "all" 
      ? nbaProjections 
      : nbaProjections.filter(proj => 
          proj.projection.attributes.stat_display_name === selectedStatType
        )
  , [nbaProjections, selectedStatType])

  // Handle manual refresh with loading state
  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      await loadProjections(true) // Force refresh
    } finally {
      setIsRefreshing(false)
    }
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-500">
        <p>Error loading projections: {error}</p>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="mt-4"
        >
          Try Again
        </Button>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-none shadow-lg">
      <LineMovementToast lineMovements={lineMovements} projections={nbaProjections} />
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Select
              value={selectedStatType}
              onValueChange={setSelectedStatType}
            >
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 transition-colors">
                <SelectValue placeholder="Select stat type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-gray-200 hover:bg-gray-700">All Stats</SelectItem>
                {statTypes.map((type) => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className="text-gray-200 hover:bg-gray-700"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingProjections}
            className={cn(
              "bg-gray-800 border-gray-700 text-gray-200 transition-all",
              (isRefreshing || isLoadingProjections) ? "opacity-50" : "hover:bg-gray-700"
            )}
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              (isRefreshing || isLoadingProjections) && "animate-spin"
            )} />
          </Button>
        </div>

        {lastProjectionsUpdate && (
          <p className="text-sm text-gray-400">
            Last updated: {formatDistanceToNow(new Date(lastProjectionsUpdate), { addSuffix: true })}
          </p>
        )}

        <div className="rounded-md border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800 hover:bg-gray-800 border-b border-gray-700">
                <TableHead className="text-gray-200 font-semibold">Player</TableHead>
                <TableHead className="text-gray-200 font-semibold">Team</TableHead>
                <TableHead className="text-gray-200 font-semibold">Stat</TableHead>
                <TableHead className="text-gray-200 font-semibold text-right">Line</TableHead>
                <TableHead className="text-gray-200 font-semibold text-right">Movement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProjections ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="bg-gray-900/50 hover:bg-gray-800/70 transition-colors border-b border-gray-700">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
                        <Skeleton className="h-4 w-[150px] bg-gray-800" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px] bg-gray-800" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px] bg-gray-800" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px] bg-gray-800" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px] bg-gray-800" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredProjections.map((proj) => {
                  const movement = lineMovements.get(proj.projection.id)
                  return (
                    <TableRow 
                      key={proj.projection.id}
                      className="bg-gray-900/50 hover:bg-gray-800/70 transition-colors border-b border-gray-700"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className={cn(
                            "h-8",
                            proj.player?.attributes.combo 
                              ? "w-12 rounded-lg" 
                              : "w-8 rounded-full"
                          )}>
                            {proj.player?.attributes.image_url ? (
                              <AvatarImage
                                src={proj.player.attributes.image_url}
                                alt={proj.player.attributes.display_name}
                              />
                            ) : (
                              <AvatarFallback>
                                {proj.player?.attributes.display_name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-medium text-gray-200">
                            {proj.player?.attributes.display_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {proj.player?.attributes.team_name}
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {proj.projection.attributes.stat_display_name}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-200">
                        {proj.projection.attributes.line_score}
                      </TableCell>
                      <TableCell className="text-right">
                        {movement && (
                          <div className={cn(
                            "flex items-center justify-end gap-1",
                            movement.direction === 'up' ? "text-green-400" : 
                            movement.direction === 'down' ? "text-red-400" : 
                            "text-gray-400"
                          )}>
                            {movement.direction === 'up' ? (
                              <ArrowUpIcon className="h-4 w-4" />
                            ) : movement.direction === 'down' ? (
                              <ArrowDownIcon className="h-4 w-4" />
                            ) : null}
                            <span>
                              {movement.direction === 'none' ? 
                                "None" : 
                                movement.difference.toFixed(1)
                              }
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  )
}