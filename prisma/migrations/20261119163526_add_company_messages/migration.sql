-- CreateEnum
CREATE TYPE "CompanyMessageSender" AS ENUM ('COMPANY', 'NEVALO');

-- CreateTable
CREATE TABLE "company_messages" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sender" "CompanyMessageSender" NOT NULL DEFAULT 'COMPANY',
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_messages_companyId_createdAt_idx" ON "company_messages"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "company_messages" ADD CONSTRAINT "company_messages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
