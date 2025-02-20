/*
  Warnings:

  - You are about to drop the column `fg` on the `GameStat` table. All the data in the column will be lost.
  - You are about to drop the column `ft` on the `GameStat` table. All the data in the column will be lost.
  - You are about to drop the column `threePt` on the `GameStat` table. All the data in the column will be lost.
  - The primary key for the `Player` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `defRebounds` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fantasyPoints` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fgAttempted` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fgMade` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fgPercentage` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ftAttempted` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ftMade` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ftPercentage` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offRebounds` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalFouls` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `technicals` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threePtAttempted` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threePtMade` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threePtPercentage` to the `GameStat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GameStat" DROP CONSTRAINT "GameStat_playerId_fkey";

-- AlterTable
ALTER TABLE "GameStat" DROP COLUMN "fg",
DROP COLUMN "ft",
DROP COLUMN "threePt",
ADD COLUMN     "defRebounds" INTEGER NOT NULL,
ADD COLUMN     "fantasyPoints" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fgAttempted" INTEGER NOT NULL,
ADD COLUMN     "fgMade" INTEGER NOT NULL,
ADD COLUMN     "fgPercentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ftAttempted" INTEGER NOT NULL,
ADD COLUMN     "ftMade" INTEGER NOT NULL,
ADD COLUMN     "ftPercentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "gameId" TEXT NOT NULL,
ADD COLUMN     "offRebounds" INTEGER NOT NULL,
ADD COLUMN     "personalFouls" INTEGER NOT NULL,
ADD COLUMN     "teamId" TEXT NOT NULL,
ADD COLUMN     "technicals" INTEGER NOT NULL,
ADD COLUMN     "threePtAttempted" INTEGER NOT NULL,
ADD COLUMN     "threePtMade" INTEGER NOT NULL,
ADD COLUMN     "threePtPercentage" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "playerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Player" DROP CONSTRAINT "Player_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Player_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "GameStat_gameId_idx" ON "GameStat"("gameId");

-- AddForeignKey
ALTER TABLE "GameStat" ADD CONSTRAINT "GameStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
