/*
  Warnings:

  - You are about to drop the column `companyId` on the `company_messages` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `company_messages` table. All the data in the column will be lost.
  - Added the required column `threadId` to the `company_messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "company_messages" DROP CONSTRAINT "company_messages_companyId_fkey";

-- DropIndex
DROP INDEX "company_messages_companyId_createdAt_idx";

-- AlterTable
ALTER TABLE "company_messages" DROP COLUMN "companyId",
DROP COLUMN "subject",
ADD COLUMN     "threadId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "company_threads" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_threads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_threads_companyId_updatedAt_idx" ON "company_threads"("companyId", "updatedAt");

-- CreateIndex
CREATE INDEX "company_messages_threadId_createdAt_idx" ON "company_messages"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "company_threads" ADD CONSTRAINT "company_threads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_messages" ADD CONSTRAINT "company_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "company_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
