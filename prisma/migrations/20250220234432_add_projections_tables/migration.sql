/*
  Warnings:

  - You are about to drop the `ProjectionData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectionName` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectionData" DROP CONSTRAINT "ProjectionData_projectionNameId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectionName" DROP CONSTRAINT "ProjectionName_playerId_fkey";

-- DropTable
DROP TABLE "ProjectionData";

-- DropTable
DROP TABLE "ProjectionName";

-- CreateTable
CREATE TABLE "ProjectionPlayer" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projection" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "statDisplayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lineScore" DOUBLE PRECISION NOT NULL,
    "statType" TEXT NOT NULL,
    "projectionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "gameId" TEXT,
    "odds" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Projection_playerId_idx" ON "Projection"("playerId");

-- CreateIndex
CREATE INDEX "Projection_gameId_idx" ON "Projection"("gameId");

-- AddForeignKey
ALTER TABLE "Projection" ADD CONSTRAINT "Projection_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "ProjectionPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
