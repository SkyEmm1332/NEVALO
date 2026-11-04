-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "recommend" BOOLEAN;
