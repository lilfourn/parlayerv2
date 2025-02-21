import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchProjectionsFromAPI } from '../utils';
import type { Projection } from '@/types/projections';

// Helper function to safely convert odds to float or null
function parseOdds(odds: any): number | null {
  if (odds === null || odds === undefined || odds === true || odds === false) return null;
  if (typeof odds === 'number') return odds;
  if (typeof odds === 'string') {
    const parsed = parseFloat(odds);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

// Helper function to ensure string value or default
function ensureString(value: any, defaultValue: string = 'N/A'): string {
  if (!value) return defaultValue;
  return String(value);
}

// Helper function to parse float with default
function parseFloat_(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to parse date or return null
function parseDate(value: any): Date | null {
  if (!value) return null;
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting projections data fetch...');
    
    // Get projections from request body or fetch them if not provided
    let projections: Projection[];
    try {
      const body = await request.json();
      projections = body.projections;
    } catch {
      // If no projections in request body, fetch them directly
      projections = await fetchProjectionsFromAPI();
    }

    console.log('Processing projections data:', {
      totalProjections: projections?.length || 0,
      sampleProjection: projections?.[0] ? {
        id: projections[0].id,
        type: projections[0].type,
        hasAttributes: !!projections[0].attributes,
        hasConnected: !!projections[0].connected,
      } : null
    });

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each projection
    for (const projection of projections) {
      try {
        const playerData = projection.connected?.new_player;
        if (!playerData || !playerData.attributes || playerData.attributes.display_name === 'team') {
          skippedCount++;
          console.log('Skipping projection:', {
            reason: !playerData ? 'No player data' : 
                    !playerData.attributes ? 'No player attributes' : 
                    'Team projection',
            projectionId: projection.id,
            gameId: projection.attributes?.game_id
          });
          continue;
        }

        // First ensure the Player exists in the database
        const player = await prisma.player.upsert({
          where: { id: playerData.id },
          create: {
            id: playerData.id,
            name: ensureString(playerData.attributes.name),
          },
          update: {
            name: ensureString(playerData.attributes.name),
            lastUpdated: new Date(),
          },
        });

        // Create or update ProjectionName record
        const dbProjectionName = await prisma.projectionName.upsert({
          where: {
            playerId: playerData.id,
          },
          create: {
            playerId: playerData.id,
            displayName: ensureString(playerData.attributes.display_name),
          },
          update: {
            displayName: ensureString(playerData.attributes.display_name),
            updatedAt: new Date(),
          },
        });

        // Check if this projection ID already exists
        const existingProjection = await prisma.projectionData.findFirst({
          where: {
            id: projection.id,
          },
        });

        if (existingProjection) {
          console.log('Skipping duplicate projection:', {
            projectionId: projection.id,
            gameId: projection.attributes?.game_id
          });
          skippedCount++;
          continue;
        }

        // Handle required fields and data type conversions
        const startTime = parseDate(projection.attributes.start_time);
        if (!startTime) {
          throw new Error('Invalid or missing start time');
        }

        const projectionData = {
          id: projection.id, // Use the API's projection ID
          projectionNameId: dbProjectionName.id,
          gameId: ensureString(projection.attributes.game_id),
          statType: ensureString(projection.attributes.stat_type),
          lineScore: parseFloat_(projection.attributes.line_score),
          startTime,
          endTime: parseDate(projection.attributes.end_time),
          status: ensureString(projection.attributes.status, 'pre_game'),
          odds: parseOdds(projection.attributes.adjusted_odds),
        };

        // Create ProjectionData record
        await prisma.projectionData.create({
          data: projectionData,
        });

        successCount++;
      } catch (error) {
        console.error('Error processing projection:', {
          projectionId: projection.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          attributes: projection.attributes
        });
        errorCount++;
      }
    }

    console.log('Finished processing projections:', {
      total: projections.length,
      success: successCount,
      skipped: skippedCount,
      errors: errorCount
    });

    return NextResponse.json({
      success: true,
      message: 'Projections data updated successfully',
      stats: {
        total: projections.length,
        success: successCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Fatal error updating projections data:', { error });
    return NextResponse.json(
      { success: false, error: 'Failed to update projections data' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const gameId = searchParams.get('gameId');
    const date = searchParams.get('date');

    let projections;
    if (playerId) {
      // Get projections for a specific player
      projections = await prisma.projectionName.findUnique({
        where: {
          playerId,
        },
        include: {
          projections: {
            orderBy: {
              startTime: 'desc',
            },
            take: 10, // Get last 10 projections
          },
        },
      });
    } else if (gameId) {
      // Get projections for a specific game
      projections = await prisma.projectionData.findMany({
        where: { gameId },
        include: {
          projectionName: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      });
    } else if (date) {
      // Get projections for a specific date
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      projections = await prisma.projectionData.findMany({
        where: {
          startTime: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          projectionName: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      });
    } else {
      // Get all projections for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      projections = await prisma.projectionData.findMany({
        where: {
          startTime: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          projectionName: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      });
    }

    return NextResponse.json({ success: true, data: projections });
  } catch (error) {
    console.error('Error fetching projections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projections' },
      { status: 500 }
    );
  }
}