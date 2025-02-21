/*
  Warnings:

  - Added the required column `statDisplayName` to the `ProjectionData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectionData" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statDisplayName" TEXT NOT NULL;
