/*
  Warnings:

  - A unique constraint covering the columns `[userId,applicationId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `applicationId` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Application_userId_applicationUrl_key";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "applicationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_applicationId_key" ON "Application"("userId", "applicationId");
