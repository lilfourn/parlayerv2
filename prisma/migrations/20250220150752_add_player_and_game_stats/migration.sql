-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameStat" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "rebounds" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "steals" INTEGER NOT NULL,
    "blocks" INTEGER NOT NULL,
    "turnovers" INTEGER NOT NULL,
    "fg" TEXT NOT NULL,
    "threePt" TEXT NOT NULL,
    "ft" TEXT NOT NULL,
    "plusMinus" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "GameStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameStat_playerId_idx" ON "GameStat"("playerId");

-- AddForeignKey
ALTER TABLE "GameStat" ADD CONSTRAINT "GameStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
