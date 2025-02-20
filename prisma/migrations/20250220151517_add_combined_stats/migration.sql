/*
  Warnings:

  - Added the required column `fg` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ft` to the `GameStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threePt` to the `GameStat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameStat" ADD COLUMN     "fg" TEXT NOT NULL,
ADD COLUMN     "ft" TEXT NOT NULL,
ADD COLUMN     "threePt" TEXT NOT NULL;
