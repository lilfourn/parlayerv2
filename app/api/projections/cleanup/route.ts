import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function findAndRemoveDuplicates() {
  console.log('Starting duplicate projection cleanup...');
  
  // Get all projections
  const allProjections = await prisma.projectionData.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      gameId: true,
      projectionNameId: true,
      statType: true,
      lineScore: true,
      createdAt: true
    }
  });

  // Group projections by their key attributes
  const groups = allProjections.reduce((acc, proj) => {
    const key = `${proj.gameId}|${proj.projectionNameId}|${proj.statType}|${proj.lineScore}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(proj);
    return acc;
  }, {} as Record<string, typeof allProjections>);

  // Find groups with duplicates
  const duplicateGroups = Object.entries(groups)
    .filter(([_, projs]) => projs.length > 1)
    .map(([key, projs]) => ({
      key,
      projections: projs,
      count: projs.length
    }));

  console.log(`Found ${duplicateGroups.length} groups of duplicate projections`);

  let deletedCount = 0;
  let errorCount = 0;
  const details: Array<{
    gameId: string;
    statType: string;
    lineScore: number;
    duplicateCount: number;
    keptId: string;
    deletedIds: string[];
  }> = [];

  // For each group of duplicates, keep the newest one and delete the rest
  for (const group of duplicateGroups) {
    try {
      // Sort by createdAt desc and keep the newest one
      const [keep, ...duplicates] = group.projections;
      const deleteIds = duplicates.map(d => d.id);

      // Delete all but the newest projection
      await prisma.projectionData.deleteMany({
        where: {
          id: {
            in: deleteIds
          }
        }
      });

      deletedCount += deleteIds.length;
      details.push({
        gameId: keep.gameId,
        statType: keep.statType,
        lineScore: keep.lineScore,
        duplicateCount: group.count,
        keptId: keep.id,
        deletedIds: deleteIds
      });

      console.log(`Cleaned up duplicates for game ${keep.gameId}:`, {
        keptId: keep.id,
        deletedIds: deleteIds,
        statType: keep.statType,
        lineScore: keep.lineScore
      });
    } catch (error) {
      errorCount++;
      console.error('Error cleaning up duplicates:', {
        key: group.key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return {
    totalDuplicateGroups: duplicateGroups.length,
    deletedProjections: deletedCount,
    errors: errorCount,
    details
  };
}

export async function POST() {
  try {
    const results = await findAndRemoveDuplicates();
    
    return NextResponse.json({
      success: true,
      message: 'Duplicate projections cleanup completed',
      results
    });
  } catch (error) {
    console.error('Error in duplicate projections cleanup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clean up duplicate projections' },
      { status: 500 }
    );
  }
}
