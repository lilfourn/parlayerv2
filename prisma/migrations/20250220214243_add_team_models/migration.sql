-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "conference" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamStat" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "pointsPerGame" DOUBLE PRECISION NOT NULL,
    "oppPointsPerGame" DOUBLE PRECISION NOT NULL,
    "fieldGoalsMade" INTEGER NOT NULL,
    "fieldGoalsAttempted" INTEGER NOT NULL,
    "fieldGoalPercentage" DOUBLE PRECISION NOT NULL,
    "threePtMade" INTEGER NOT NULL,
    "threePtAttempted" INTEGER NOT NULL,
    "threePtPercentage" DOUBLE PRECISION NOT NULL,
    "freeThrowsMade" INTEGER NOT NULL,
    "freeThrowsAttempted" INTEGER NOT NULL,
    "freeThrowPercentage" DOUBLE PRECISION NOT NULL,
    "offensiveRebounds" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "turnovers" INTEGER NOT NULL,
    "defensiveRebounds" INTEGER NOT NULL,
    "steals" INTEGER NOT NULL,
    "blocks" INTEGER NOT NULL,
    "personalFouls" INTEGER NOT NULL,
    "fastBreakPoints" INTEGER NOT NULL,
    "pointsInPaint" INTEGER NOT NULL,
    "pointsOffTurnovers" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "TeamStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamStat_teamId_idx" ON "TeamStat"("teamId");

-- CreateIndex
CREATE INDEX "TeamStat_date_idx" ON "TeamStat"("date");

-- AddForeignKey
ALTER TABLE "TeamStat" ADD CONSTRAINT "TeamStat_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
