import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerName = searchParams.get('playerName');

    if (!playerName) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    // First find the player by name
    const player = await prisma.player.findFirst({
      where: {
        name: playerName
      }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Then get all their game stats
    const gameStats = await prisma.gameStat.findMany({
      where: {
        playerId: player.id
      },
      orderBy: {
        gameId: 'desc'
      }
    });

    return NextResponse.json(gameStats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 });
  }
}
