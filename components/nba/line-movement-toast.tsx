'use client';

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { LineMovement } from "@/store/nba-store";
import { ProjectionWithAttributes } from "@/types/projections";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LineMovementToastProps {
  lineMovements: Map<string, LineMovement>;
  projections: ProjectionWithAttributes[];
}

interface MovedLine {
  playerName: string;
  playerImage: string | null;
  teamName: string | null;
  statType: string;
  oldLine: number;
  newLine: number;
  direction: 'up' | 'down';
  difference: number;
}

export function LineMovementToast({ lineMovements, projections }: LineMovementToastProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [movedLines, setMovedLines] = useState<MovedLine[]>([]);

  useEffect(() => {
    // Get movements (excluding 'none')
    const movements = Array.from(lineMovements.entries())
      .filter(([_, movement]) => movement.direction !== 'none');

    if (movements.length > 0) {
      // Calculate moved lines details
      const movedLinesDetails = movements.map(([projId, movement]) => {
        const projection = projections.find(p => p.projection.id === projId);
        if (!projection) return null;

        return {
          playerName: projection.player?.attributes.display_name || 'Unknown Player',
          playerImage: projection.player?.attributes.image_url || null,
          teamName: projection.player?.attributes.team_name || null,
          statType: projection.projection.attributes.stat_display_name,
          oldLine: projection.projection.attributes.line_score - (movement.direction === 'up' ? movement.difference : -movement.difference),
          newLine: projection.projection.attributes.line_score,
          direction: movement.direction,
          difference: movement.difference,
        };
      }).filter((line): line is MovedLine => line !== null);

      setMovedLines(movedLinesDetails);

      const upMoves = movements.filter(([_, m]) => m.direction === 'up').length;
      const downMoves = movements.filter(([_, m]) => m.direction === 'down').length;

      toast({
        title: "Line Movements Detected",
        description: (
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <div>{movements.length} lines have moved ({upMoves} ⬆️, {downMoves} ⬇️)</div>
            <div className="text-sm text-gray-400 mt-1">Click to view details</div>
          </button>
        ),
        variant: "default",
        className: "bg-gray-900 border-gray-800 text-gray-100 cursor-pointer",
      });
    }
  }, [lineMovements, projections, toast]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl bg-gray-900 text-gray-100 border-gray-800">
        <DialogHeader>
          <DialogTitle>Line Movements</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-3">
            {movedLines.map((line, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <Avatar className={cn(
                    "h-8",
                    line.playerImage?.includes('combo') ? "w-12 rounded-lg" : "w-8 rounded-full"
                  )}>
                    {line.playerImage ? (
                      <AvatarImage
                        src={line.playerImage}
                        alt={line.playerName}
                      />
                    ) : (
                      <AvatarFallback>
                        {line.playerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{line.playerName}</div>
                    <div className="text-sm text-gray-400">
                      {line.teamName} • {line.statType}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-gray-400">{line.oldLine}</div>
                  <div className="text-gray-400">→</div>
                  <div className={cn(
                    "flex items-center gap-1 font-medium",
                    line.direction === 'up' ? "text-green-400" : "text-red-400"
                  )}>
                    {line.newLine}
                    {line.direction === 'up' ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
