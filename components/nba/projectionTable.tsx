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
import { formatDistanceToNow, format, parseISO } from "date-fns"
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
import { NBA_TEAM_COLORS } from "./teamCard"
import React from "react"

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

const getTeamIdentifier = (team?: string): string => {
  if (!team) return 'UNKNOWN';
  
  // First try to match the team abbreviation directly
  if (NBA_TEAM_COLORS[team]) return team;
  
  // If not found, try to match the full team name to an abbreviation
  const teamMapping: Record<string, string> = {
    'Hawks': 'ATL',
    'Celtics': 'BOS',
    'Nets': 'BKN',
    'Hornets': 'CHA',
    'Bulls': 'CHI',
    'Cavaliers': 'CLE',
    'Mavericks': 'DAL',
    'Nuggets': 'DEN',
    'Pistons': 'DET',
    'Warriors': 'GSW',
    'Rockets': 'HOU',
    'Pacers': 'IND',
    'Clippers': 'LAC',
    'Lakers': 'LAL',
    'Grizzlies': 'MEM',
    'Heat': 'MIA',
    'Bucks': 'MIL',
    'Timberwolves': 'MIN',
    'Pelicans': 'NOP',
    'Knicks': 'NYK',
    'Thunder': 'OKC',
    'Magic': 'ORL',
    '76ers': 'PHI',
    'Suns': 'PHX',
    'Trail Blazers': 'POR',
    'Kings': 'SAC',
    'Spurs': 'SAS',
    'Raptors': 'TOR',
    'Jazz': 'UTA',
    'Wizards': 'WAS'
  };

  // Try to match the full team name
  for (const [fullName, abbr] of Object.entries(teamMapping)) {
    if (team.includes(fullName)) return abbr;
  }

  return 'UNKNOWN';
};

const getTeamColorClasses = (teamIdentifier: string): string => {
  const teamColors = NBA_TEAM_COLORS[teamIdentifier] || { primary: 'zinc', secondary: 'zinc' };
  
  // Map team colors to specific Tailwind classes that are statically defined
  const colorClassMap: Record<string, { bg: string, hover: string }> = {
    'ATL': { bg: 'from-red-500/5 to-green-500/5', hover: 'hover:bg-red-500/10' },
    'BOS': { bg: 'from-green-500/5 to-yellow-500/5', hover: 'hover:bg-green-500/10' },
    'BKN': { bg: 'from-zinc-500/5 to-zinc-400/5', hover: 'hover:bg-zinc-500/10' },
    'CHA': { bg: 'from-purple-500/5 to-teal-500/5', hover: 'hover:bg-purple-500/10' },
    'CHI': { bg: 'from-red-500/5 to-zinc-500/5', hover: 'hover:bg-red-500/10' },
    'CLE': { bg: 'from-red-500/5 to-blue-500/5', hover: 'hover:bg-red-500/10' },
    'DAL': { bg: 'from-blue-500/5 to-blue-400/5', hover: 'hover:bg-blue-500/10' },
    'DEN': { bg: 'from-blue-500/5 to-yellow-500/5', hover: 'hover:bg-blue-500/10' },
    'DET': { bg: 'from-red-500/5 to-blue-500/5', hover: 'hover:bg-red-500/10' },
    'GSW': { bg: 'from-blue-500/5 to-yellow-500/5', hover: 'hover:bg-blue-500/10' },
    'HOU': { bg: 'from-red-500/5 to-zinc-500/5', hover: 'hover:bg-red-500/10' },
    'IND': { bg: 'from-yellow-500/5 to-blue-500/5', hover: 'hover:bg-yellow-500/10' },
    'LAC': { bg: 'from-blue-500/5 to-red-500/5', hover: 'hover:bg-blue-500/10' },
    'LAL': { bg: 'from-yellow-500/5 to-purple-500/5', hover: 'hover:bg-yellow-500/10' },
    'MEM': { bg: 'from-blue-500/5 to-yellow-500/5', hover: 'hover:bg-blue-500/10' },
    'MIA': { bg: 'from-red-500/5 to-black/5', hover: 'hover:bg-red-500/10' },
    'MIL': { bg: 'from-green-500/5 to-cream-500/5', hover: 'hover:bg-green-500/10' },
    'MIN': { bg: 'from-blue-500/5 to-green-500/5', hover: 'hover:bg-blue-500/10' },
    'NOP': { bg: 'from-blue-500/5 to-gold-500/5', hover: 'hover:bg-blue-500/10' },
    'NYK': { bg: 'from-blue-500/5 to-orange-500/5', hover: 'hover:bg-blue-500/10' },
    'OKC': { bg: 'from-blue-500/5 to-orange-500/5', hover: 'hover:bg-blue-500/10' },
    'ORL': { bg: 'from-blue-500/5 to-black/5', hover: 'hover:bg-blue-500/10' },
    'PHI': { bg: 'from-blue-500/5 to-red-500/5', hover: 'hover:bg-blue-500/10' },
    'PHX': { bg: 'from-purple-500/5 to-orange-500/5', hover: 'hover:bg-purple-500/10' },
    'POR': { bg: 'from-red-500/5 to-black/5', hover: 'hover:bg-red-500/10' },
    'SAC': { bg: 'from-purple-500/5 to-zinc-500/5', hover: 'hover:bg-purple-500/10' },
    'SAS': { bg: 'from-zinc-500/5 to-black/5', hover: 'hover:bg-zinc-500/10' },
    'TOR': { bg: 'from-red-500/5 to-black/5', hover: 'hover:bg-red-500/10' },
    'UTA': { bg: 'from-yellow-500/5 to-blue-500/5', hover: 'hover:bg-yellow-500/10' },
    'WAS': { bg: 'from-blue-500/5 to-red-500/5', hover: 'hover:bg-blue-500/10' }
  };

  return colorClassMap[teamIdentifier] ? 
    `bg-gradient-to-r ${colorClassMap[teamIdentifier].bg} ${colorClassMap[teamIdentifier].hover}` :
    'bg-gradient-to-r from-zinc-500/5 to-zinc-400/5 hover:bg-zinc-500/10';
};

const TableRowWithTeamStyle = ({ children, projection }: { children: React.ReactNode; projection: ProjectionWithAttributes }) => {
  const teamIdentifier = getTeamIdentifier(projection.player?.attributes.team);
  const teamColorClasses = getTeamColorClasses(teamIdentifier);
  
  // Convert children to array and ensure it's not null/undefined
  const childrenArray = React.Children.toArray(children);
  
  // Early return if no children
  if (childrenArray.length === 0) return null;

  // Helper function to add rounded corner classes to a cell
  const addRoundedClass = (element: React.ReactElement<React.HTMLAttributes<HTMLTableCellElement>>, isFirst: boolean) => {
    if (element.type === TableCell) {
      return React.cloneElement(element, {
        ...element.props,
        className: cn(
          element.props.className,
          isFirst ? "rounded-l-md" : "rounded-r-md"
        )
      });
    }
    return element;
  };
  
  return (
    <TableRow className={cn(
      "relative group transition-colors cursor-pointer",
      "my-1 overflow-hidden",
      "rounded-md",
      teamColorClasses,
      "border border-transparent hover:border-gray-200/30"
    )}>
      {/* First cell with rounded left corners */}
      {addRoundedClass(childrenArray[0] as React.ReactElement<React.HTMLAttributes<HTMLTableCellElement>>, true)}
      
      {/* Middle cells */}
      {childrenArray.slice(1, -1)}
      
      {/* Last cell with rounded right corners */}
      {childrenArray.length > 1 && addRoundedClass(
        childrenArray[childrenArray.length - 1] as React.ReactElement<React.HTMLAttributes<HTMLTableCellElement>>, 
        false
      )}
    </TableRow>
  );
};

export function ProjectionTable({ className }: ProjectionTableProps) {
  const [selectedStatType, setSelectedStatType] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjections.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredProjections.slice(startIndex, endIndex)

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of table
    const tableElement = document.querySelector('.projection-table')
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
    <Card className={cn(
      "relative overflow-hidden",
      "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-none shadow-lg",
      className
    )}>
      <div className="relative rounded-md projection-table">
        <LineMovementToast lineMovements={lineMovements} projections={nbaProjections} />
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Select 
                value={selectedStatType} 
                onValueChange={setSelectedStatType}
              >
                <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-700 text-gray-200 shadow-[0_0_15px_rgba(139,92,246,0.1)] focus:ring-purple-500/20 focus:ring-offset-0">
                  <SelectValue placeholder="Select Stat Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-gray-700 text-gray-200 shadow-lg shadow-purple-500/10">
                  <SelectItem value="all" className="focus:bg-purple-500/20 focus:text-gray-100">All Stats</SelectItem>
                  {statTypes.map((type) => (
                    <SelectItem 
                      key={type} 
                      value={type}
                      className="focus:bg-purple-500/20 focus:text-gray-100"
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
            <Table className="relative">
              <TableHeader className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-gray-200 font-semibold">Player</TableHead>
                  <TableHead className="text-gray-200 font-semibold">Team</TableHead>
                  <TableHead className="text-gray-200 font-semibold">Stat</TableHead>
                  <TableHead className="text-gray-200 font-semibold text-right">Line</TableHead>
                  <TableHead className="text-gray-200 font-semibold text-right">Movement</TableHead>
                  <TableHead className="text-gray-200 font-semibold text-right">Start Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProjections ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="bg-gray-900/50 hover:bg-gray-800/70 transition-colors border-b border-gray-700 my-1 rounded-md overflow-hidden">
                      <TableCell className="py-3 first:rounded-l-md">
                        <Skeleton className="h-6 w-32 bg-gray-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 bg-gray-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-28 bg-gray-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 bg-gray-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 bg-gray-800" />
                      </TableCell>
                      <TableCell className="last:rounded-r-md">
                        <Skeleton className="h-6 w-36 bg-gray-800" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  currentItems.map((proj) => {
                    const movement = lineMovements.get(proj.projection.id)
                    const startTime = proj.projection.attributes.start_time ? 
                      format(parseISO(proj.projection.attributes.start_time), "MMM d - h:mmaaa zzz") : 
                      'TBD'

                    return (
                      <TableRowWithTeamStyle key={proj.projection.id} projection={proj}>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className={cn(
                              "h-8",
                              proj.player?.attributes.combo ? "w-14 rounded-lg" : "w-8 rounded-full"
                            )}>
                              <AvatarImage 
                                src={proj.player?.attributes.image_url || ''} 
                                alt={proj.player?.attributes.display_name || ''} 
                              />
                              <AvatarFallback>{proj.player?.attributes.display_name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-gray-200">{proj.player?.attributes.display_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-300">{proj.player?.attributes.team_name || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-300">{proj.projection.attributes.stat_display_name}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-gray-200 font-medium">{proj.projection.attributes.line_score}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {movement && movement.direction !== 'none' ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className={cn(
                                "text-sm font-medium",
                                movement.direction === 'up' ? "text-green-400" : "text-red-400"
                              )}>
                                {movement.difference}
                              </span>
                              {movement.direction === 'up' ? (
                                <ArrowUpIcon className="h-4 w-4 text-green-400" />
                              ) : (
                                <ArrowDownIcon className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-gray-300">{startTime}</span>
                        </TableCell>
                      </TableRowWithTeamStyle>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoadingProjections && totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex w-[100px] items-center justify-start text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-900/50 border-gray-700 text-gray-200 hover:bg-gray-800/80 hover:border-purple-500/50 shadow-[0_0_10px_rgba(139,92,246,0.1)] disabled:opacity-50"
                >
                  Previous
                </Button>
                {totalPages <= 7 ? (
                  Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                      className={cn(
                        "shadow-[0_0_10px_rgba(139,92,246,0.1)]",
                        currentPage === i + 1 
                          ? "bg-purple-600/80 text-white hover:bg-purple-500/80 border-purple-400/50"
                          : "bg-gray-900/50 border-gray-700 text-gray-200 hover:bg-gray-800/80 hover:border-purple-500/50"
                      )}
                    >
                      {i + 1}
                    </Button>
                  ))
                ) : (
                  <>
                    {[1, 2, 3].map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "shadow-[0_0_10px_rgba(139,92,246,0.1)]",
                          currentPage === page 
                            ? "bg-purple-600/80 text-white hover:bg-purple-500/80 border-purple-400/50"
                            : "bg-gray-900/50 border-gray-700 text-gray-200 hover:bg-gray-800/80 hover:border-purple-500/50"
                        )}
                      >
                        {page}
                      </Button>
                    ))}
                    <span className="text-gray-500">...</span>
                    {[totalPages - 2, totalPages - 1, totalPages].map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "shadow-[0_0_10px_rgba(139,92,246,0.1)]",
                          currentPage === page 
                            ? "bg-purple-600/80 text-white hover:bg-purple-500/80 border-purple-400/50"
                            : "bg-gray-900/50 border-gray-700 text-gray-200 hover:bg-gray-800/80 hover:border-purple-500/50"
                        )}
                      >
                        {page}
                      </Button>
                    ))}
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-900/50 border-gray-700 text-gray-200 hover:bg-gray-800/80 hover:border-purple-500/50 shadow-[0_0_10px_rgba(139,92,246,0.1)] disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
              <div className="w-[100px]" /> {/* Spacer for alignment */}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}