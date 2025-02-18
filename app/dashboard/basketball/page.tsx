'use client';

import { TeamCard } from '@/components/nba/teamCard';
import { NBATabs } from '@/components/nba/nbaTabs';
import type { NBATeam } from '@/types/nba';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

async function getTeams() {
  const res = await fetch('http://localhost:3000/api/nba/teams', {
    next: { revalidate: 300 } // Revalidate every 5 minutes
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch teams');
  }

  const data = await res.json();
  return data.body as NBATeam[];
}

export default function NBADashboard() {
  const [sidebarWidth, setSidebarWidth] = useState(72);
  const [teams, setTeams] = useState<NBATeam[]>([]);
  const sortedTeams = [...teams].sort((a, b) => parseInt(b.wins) - parseInt(a.wins));

  useEffect(() => {
    const fetchTeams = async () => {
      const data = await getTeams();
      setTeams(data);
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector('[class*="fixed left-0 top-0 h-screen"]')
    if (!sidebar) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarWidth(entry.contentRect.width)
      }
    });

    resizeObserver.observe(sidebar);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <motion.div 
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ 
        paddingLeft: `${sidebarWidth + 8}px`,
        paddingRight: '0.5rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl text-white font-bold mb-8">NBA Dashboard</h1>
        <NBATabs defaultTab="teams">
          <div className="space-y-4">
            {sortedTeams.map((team) => (
              <TeamCard 
                key={team.teamID} 
                team={team} 
                sidebarWidth={sidebarWidth}
              />
            ))}
          </div>
        </NBATabs>
      </div>
    </motion.div>
  );
}