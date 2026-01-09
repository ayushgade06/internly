/*
  Warnings:

  - You are about to drop the column `url` on the `Internship` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Internship" DROP COLUMN "url",
ALTER COLUMN "appliedOn" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
