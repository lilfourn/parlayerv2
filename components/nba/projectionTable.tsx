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

// Create an array of valid league IDs
const VALID_LEAGUE_IDS = Object.values(NBA_LEAGUE_IDS)

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

  useEffect(() => {
    loadProjections()
  }, [loadProjections])

  // Calculate line movements for all projections
  const lineMovements = useMemo(() => 
    calculateLineMovements(projections)
  , [projections, calculateLineMovements])

  // Extract unique stat types from projections
  const statTypes = useMemo(() => {
    const types = new Set<string>()
    projections.forEach((proj) => {
      const statType = proj.projection.attributes.stat_display_name
      if (statType) types.add(statType)
    })
    return Array.from(types).sort()
  }, [projections])

  // Filter projections by selected stat type
  const filteredProjections = useMemo(() => 
    selectedStatType === "all" 
      ? projections 
      : projections.filter(proj => 
          proj.projection.attributes.stat_display_name === selectedStatType
        )
  , [projections, selectedStatType])

  // Handle manual refresh with loading state
  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      await loadProjections()
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
    <Card className={className}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedStatType}
            onValueChange={setSelectedStatType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select stat type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stats</SelectItem>
              {statTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          {lastProjectionsUpdate && (
            <span className="text-sm text-muted-foreground">
              Last updated: {formatDistanceToNow(lastProjectionsUpdate, { addSuffix: true })}
            </span>
          )}
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingProjections}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Stat Type</TableHead>
            <TableHead className="text-right">Line</TableHead>
            <TableHead>Movement</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingProjections ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : filteredProjections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No projections found for selected stat type
              </TableCell>
            </TableRow>
          ) : (
            filteredProjections.map((projection) => (
              <TableRow key={projection.projection.id}>
                <TableCell className="font-medium">
                  {projection.player?.attributes.display_name}
                </TableCell>
                <TableCell>{projection.player?.attributes.team_name}</TableCell>
                <TableCell>{projection.projection.attributes.stat_display_name}</TableCell>
                <TableCell className="text-right">
                  {projection.projection.attributes.line_score}
                </TableCell>
                <TableCell>
                  {(() => {
                    const movement = lineMovements.get(projection.projection.id)
                    if (!movement) return null

                    if (movement.direction === 'none') {
                      return <span className="text-muted-foreground text-sm">No Change</span>
                    }

                    return (
                      <div className="flex items-center gap-1">
                        {movement.direction === "up" ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {movement.difference.toFixed(1)}
                        </span>
                      </div>
                    )
                  })()}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(projection.projection.attributes.updated_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}