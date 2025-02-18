'use client';

import { Card } from '@/components/ui/card';
import { NBATeam } from '@/types/nba';
import { BarChart } from '@tremor/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeamCardProps {
  team: NBATeam;
}

export function TeamCard({ team }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExpanded) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / (rect.height / 2)) * -3;
    const rotateYValue = (mouseX / (rect.width / 2)) * 3;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Prepare data for charts
  const offensiveData = [
    { category: 'Points', value: parseFloat(team.ppg) },
    { category: 'Assists', value: parseFloat(team.offensiveStats.ast.Total) },
    { category: 'Rebounds', value: parseFloat(team.offensiveStats.reb.Total) },
  ];

  const defensiveData = [
    { category: 'Points Allowed', value: parseFloat(team.oppg) },
    { category: 'Blocks', value: parseFloat(team.defensiveStats.blk.Total) },
    { category: 'Steals', value: parseFloat(team.defensiveStats.stl.Total) },
  ];

  const teamColor = team.teamAbv === 'ORL' ? 'blue' : 
                   team.teamAbv === 'LAL' ? 'purple' :
                   team.teamAbv === 'BOS' ? 'green' : 'red';

  return (
    <motion.div
      layout
      className="w-full cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        perspective: "1500px",
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX: isExpanded ? 0 : rotateX,
        rotateY: isExpanded ? 0 : rotateY,
        height: isExpanded ? 'auto' : '160px',
      }}
      transition={{
        layout: { type: "spring", bounce: 0.2 },
        height: { duration: 0.3 },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Card className={cn(
        "w-full overflow-hidden rounded-[24px] transform-gpu",
        "bg-gradient-to-r",
        `from-${teamColor}-500/20 via-${teamColor}-400/10 to-${teamColor}-300/5`,
        "hover:shadow-xl hover:shadow-black/20",
        "transition-all duration-300 ease-out"
      )}>
        {/* Preview Section */}
        <div className="relative w-full h-40 px-6 flex items-center justify-between">
          {/* Team Info */}
          <div className="flex items-center space-x-6">
            <motion.div 
              className="relative w-24 h-24"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Image
                src={team.nbaComLogo1}
                alt={`${team.teamName} logo`}
                fill
                className="object-contain drop-shadow-lg"
              />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {team.teamCity} {team.teamName}
              </h2>
              <p className="text-white/80">
                {team.conference} • {team.division}
              </p>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xl font-bold text-white/90">
                  {team.wins}W - {team.loss}L
                </span>
                <span className={cn(
                  "px-2 py-1 rounded-md text-sm font-medium",
                  team.currentStreak.result === 'W' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                )}>
                  {team.currentStreak.result}{team.currentStreak.length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-8 mr-8">
            <div className="text-center">
              <p className="text-white/60 text-sm">PPG</p>
              <p className="text-2xl font-bold text-white">{parseFloat(team.ppg).toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">OPPG</p>
              <p className="text-2xl font-bold text-white">{parseFloat(team.oppg).toFixed(1)}</p>
            </div>
            <motion.div 
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-white/80"
            >
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </motion.div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6 space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mt-4">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
                >
                  <h3 className="text-lg font-semibold mb-4 text-white/90">
                    Offensive Stats
                  </h3>
                  <BarChart
                    data={offensiveData}
                    index="category"
                    categories={["value"]}
                    colors={[teamColor]}
                    showLegend={false}
                    className="h-40"
                  />
                </motion.div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
                >
                  <h3 className="text-lg font-semibold mb-4 text-white/90">
                    Defensive Stats
                  </h3>
                  <BarChart
                    data={defensiveData}
                    index="category"
                    categories={["value"]}
                    colors={["orange"]}
                    showLegend={false}
                    className="h-40"
                  />
                </motion.div>
              </div>

              {/* Top Performers */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
              >
                <h3 className="text-lg font-semibold mb-4 text-white/90">
                  Top Performers
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white/70">Category</TableHead>
                        <TableHead className="text-white/70">Value</TableHead>
                        <TableHead className="text-white/70">Players</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(team.topPerformers).map(([category, data]) => (
                        <TableRow 
                          key={category} 
                          className="border-white/10 hover:bg-white/5"
                        >
                          <TableCell className="font-medium text-white/80 capitalize">
                            {category}
                          </TableCell>
                          <TableCell className="text-white/80">{data.total}</TableCell>
                          <TableCell className="text-white/80">
                            {data.playerID.map((id: string) => 
                              team.Roster[id]?.longName
                            ).join(', ')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>

              {/* Recent Games */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
              >
                <h3 className="text-lg font-semibold mb-4 text-white/90">
                  Recent Games
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(team.teamSchedule).slice(0, 6).map((game) => (
                    <div
                      key={game.gameID}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white/90">{game.away}</span>
                        <span className="text-white/60">@</span>
                        <span className="font-semibold text-white/90">{game.home}</span>
                      </div>
                      <span className="text-white/60">{game.gameTime}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}