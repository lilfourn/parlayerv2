import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchTeamsData } from '../route';
import type { NBATeam, TeamStats } from '@/types/nba';

export async function POST() {
  try {
    // Fetch latest teams data
    const teamsData = await fetchTeamsData();
    
    // Process each team
    for (const team of teamsData) {
      // Create or update team record
      const dbTeam = await prisma.team.upsert({
        where: { id: team.teamID },
        create: {
          id: team.teamID,
          name: team.teamName,
          abbreviation: team.teamAbv,
          city: team.teamCity,
          conference: team.conference,
          division: team.division,
        },
        update: {
          name: team.teamName,
          abbreviation: team.teamAbv,
          city: team.teamCity,
          conference: team.conference,
          division: team.division,
          lastUpdated: new Date(),
        },
      });

      // Create team stats record
      await prisma.teamStat.create({
        data: {
          teamId: dbTeam.id,
          date: new Date().toISOString().split('T')[0],
          wins: parseInt(team.wins),
          losses: parseInt(team.loss),
          pointsPerGame: parseFloat(team.ppg),
          oppPointsPerGame: parseFloat(team.oppg),
          
          // Offensive stats
          fieldGoalsMade: parseInt(team.offensiveStats.fgm.Total),
          fieldGoalsAttempted: parseInt(team.offensiveStats.fga.Total),
          fieldGoalPercentage: parseFloat(team.offensiveStats.fgm.Total) / parseFloat(team.offensiveStats.fga.Total) * 100,
          threePtMade: parseInt(team.offensiveStats.tptfgm.Total),
          threePtAttempted: parseInt(team.offensiveStats.tptfga.Total),
          threePtPercentage: parseFloat(team.offensiveStats.tptfgm.Total) / parseFloat(team.offensiveStats.tptfga.Total) * 100,
          freeThrowsMade: parseInt(team.offensiveStats.ftm.Total),
          freeThrowsAttempted: parseInt(team.offensiveStats.fta.Total),
          freeThrowPercentage: parseFloat(team.offensiveStats.ftm.Total) / parseFloat(team.offensiveStats.fta.Total) * 100,
          offensiveRebounds: parseInt(team.offensiveStats.reb.Total),
          assists: parseInt(team.offensiveStats.ast.Total),
          turnovers: parseInt(team.offensiveStats.TOV.Total),
          
          // Defensive stats
          defensiveRebounds: parseInt(team.defensiveStats.reb.Total),
          steals: parseInt(team.defensiveStats.stl.Total),
          blocks: parseInt(team.defensiveStats.blk.Total),
          personalFouls: 0,
      
          // Additional stats from game data
          fastBreakPoints: 0,
          pointsInPaint: 0,
          pointsOffTurnovers: 0,
        },
      });
    }

    return NextResponse.json({ message: 'Teams data successfully updated' });
  } catch (error) {
    console.error('Error updating teams data:', error);
    return NextResponse.json({ error: 'Failed to update teams data' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamAbbrev = searchParams.get('teamAbbrev');

    if (!teamAbbrev) {
      return NextResponse.json({ error: 'Team abbreviation is required' }, { status: 400 });
    }

    // Find the team by abbreviation
    const team = await prisma.team.findFirst({
      where: {
        abbreviation: teamAbbrev.toUpperCase(),
      },
      include: {
        teamStats: {
          orderBy: {
            date: 'desc',
          },
          take: 10, // Get last 10 stats entries
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return NextResponse.json({ error: 'Failed to fetch team stats' }, { status: 500 });
  }
}
