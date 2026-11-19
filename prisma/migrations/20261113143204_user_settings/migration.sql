-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "defaultVisibility" "Visibility" NOT NULL DEFAULT 'ANONYMOUS',
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'fr',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notifyHelpful" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyNewsletter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyOffers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyReplies" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicProfile" BOOLEAN NOT NULL DEFAULT true;
