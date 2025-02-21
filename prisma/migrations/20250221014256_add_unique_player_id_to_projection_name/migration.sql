/*
  Warnings:

  - A unique constraint covering the columns `[playerId]` on the table `ProjectionName` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProjectionName_playerId_key" ON "ProjectionName"("playerId");
