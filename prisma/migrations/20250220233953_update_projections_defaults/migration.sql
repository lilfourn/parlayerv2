/*
  Warnings:

  - Made the column `description` on table `ProjectionData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProjectionData" ALTER COLUMN "statType" SET DEFAULT 'N/A',
ALTER COLUMN "lineScore" SET DEFAULT 0,
ALTER COLUMN "startTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'N/A',
ALTER COLUMN "gameId" SET DEFAULT 'N/A',
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT 'N/A',
ALTER COLUMN "statDisplayName" SET DEFAULT 'N/A';

-- AlterTable
ALTER TABLE "ProjectionName" ALTER COLUMN "displayName" SET DEFAULT 'N/A';
