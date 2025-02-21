/*
  Warnings:

  - You are about to drop the `Projection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectionPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Projection" DROP CONSTRAINT "Projection_playerId_fkey";

-- DropTable
DROP TABLE "Projection";

-- DropTable
DROP TABLE "ProjectionPlayer";

-- CreateTable
CREATE TABLE "ProjectionName" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectionName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectionData" (
    "id" TEXT NOT NULL,
    "projectionNameId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "statType" TEXT NOT NULL,
    "lineScore" DOUBLE PRECISION NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "odds" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectionData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectionName_playerId_idx" ON "ProjectionName"("playerId");

-- CreateIndex
CREATE INDEX "ProjectionData_projectionNameId_idx" ON "ProjectionData"("projectionNameId");

-- CreateIndex
CREATE INDEX "ProjectionData_gameId_idx" ON "ProjectionData"("gameId");

-- AddForeignKey
ALTER TABLE "ProjectionName" ADD CONSTRAINT "ProjectionName_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectionData" ADD CONSTRAINT "ProjectionData_projectionNameId_fkey" FOREIGN KEY ("projectionNameId") REFERENCES "ProjectionName"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
