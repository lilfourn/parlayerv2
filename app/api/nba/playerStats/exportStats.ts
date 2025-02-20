import prisma from '@/lib/prisma'; 

interface PlayerGameStats {
  blk: string;
  OffReb: string;
  ftp: string;
  DefReb: string;
  plusMinus: string;
  stl: string;
  pts: string;
  tech: string;
  team: string;
  TOV: string;
  fga: string;
  ast: string;
  tptfgp: string;
  teamAbv: string;
  mins: string;
  fgm: string;
  fgp: string;
  reb: string;
  teamID: string;
  tptfgm: string;
  fta: string;
  tptfga: string;
  longName: string;
  PF: string;
  playerID: string;
  ftm: string;
  gameID: string;
  fantasyPoints: string;
}

interface ExportResult {
  success: boolean;
  playerId: string;
  gamesProcessed: number;
  error?: string;
}

function parseStatValue(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function extractDateFromGameId(gameId: string): string {
  return gameId.split('_')[0];
}

async function exportPlayerStats(
  playerId: string,
  playerName: string,
  gameStats: Record<string, PlayerGameStats>
): Promise<ExportResult> {
  try {
    // Create or update player first
    await prisma.player.upsert({
      where: { id: playerId },
      create: {
        id: playerId,
        name: playerName,
        lastUpdated: new Date(),
      },
      update: {
        name: playerName,
        lastUpdated: new Date(),
      },
    });

    // Delete existing game stats
    await prisma.gameStat.deleteMany({
      where: { playerId },
    });

    // Prepare game stats data
    const gameStatsData = Object.entries(gameStats).map(([gameId, stats]) => ({
      gameId,
      date: extractDateFromGameId(gameId),
      playerId,
      team: stats.team,
      teamId: stats.teamID,
      minutes: parseStatValue(stats.mins),
      points: parseStatValue(stats.pts),
      rebounds: parseStatValue(stats.reb),
      offRebounds: parseStatValue(stats.OffReb),
      defRebounds: parseStatValue(stats.DefReb),
      assists: parseStatValue(stats.ast),
      steals: parseStatValue(stats.stl),
      blocks: parseStatValue(stats.blk),
      turnovers: parseStatValue(stats.TOV),
      personalFouls: parseStatValue(stats.PF),
      technicals: parseStatValue(stats.tech),
      fgMade: parseStatValue(stats.fgm),
      fgAttempted: parseStatValue(stats.fga),
      fgPercentage: parseStatValue(stats.fgp),
      threePtMade: parseStatValue(stats.tptfgm),
      threePtAttempted: parseStatValue(stats.tptfga),
      threePtPercentage: parseStatValue(stats.tptfgp),
      ftMade: parseStatValue(stats.ftm),
      ftAttempted: parseStatValue(stats.fta),
      ftPercentage: parseStatValue(stats.ftp),
      fg: `${stats.fgm}/${stats.fga}`,
      threePt: `${stats.tptfgm}/${stats.tptfga}`,
      ft: `${stats.ftm}/${stats.fta}`,
      plusMinus: stats.plusMinus,
      fantasyPoints: parseStatValue(stats.fantasyPoints),
    }));

    // Create game stats in batches
    await prisma.gameStat.createMany({
      data: gameStatsData,
    });

    return {
      success: true,
      playerId,
      gamesProcessed: gameStatsData.length,
    };
  } catch (error) {
    console.error(`Error exporting stats for player ${playerId}:`, error);
    return {
      success: false,
      playerId,
      gamesProcessed: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function exportAllPlayerStats(
  playerStats: Record<string, { statusCode: number; body: Record<string, PlayerGameStats> }>
): Promise<ExportResult[]> {
  const results: ExportResult[] = [];

  // Process players sequentially to avoid overwhelming the database
  for (const [playerId, data] of Object.entries(playerStats)) {
    if (data.statusCode === 200 && data.body) {
      const firstGame = Object.values(data.body)[0];
      if (firstGame) {
        const result = await exportPlayerStats(playerId, firstGame.longName, data.body);
        results.push(result);
        // Add a small delay between players to prevent database connection issues
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  return results;
}