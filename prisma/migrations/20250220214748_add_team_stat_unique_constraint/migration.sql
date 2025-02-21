/*
  Warnings:

  - A unique constraint covering the columns `[teamId,date]` on the table `TeamStat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TeamStat_teamId_date_key" ON "TeamStat"("teamId", "date");
