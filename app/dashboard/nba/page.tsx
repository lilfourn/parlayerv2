import { TeamCard } from '@/components/nba/teamCard';
import type { NBATeam } from '@/types/nba';

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

export default async function NBADashboard() {
  const teams = await getTeams();

  // Sort teams by wins in descending order
  const sortedTeams = [...teams].sort((a, b) => parseInt(b.wins) - parseInt(a.wins));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">NBA Teams</h1>
      <div className="max-w-6xl mx-auto space-y-4">
        {sortedTeams.map((team) => (
          <TeamCard key={team.teamID} team={team} />
        ))}
      </div>
    </div>
  );
}