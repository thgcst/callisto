/*
  Warnings:

  - You are about to drop the `_CompanyPartners` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CompanyPartners" DROP CONSTRAINT "_CompanyPartners_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyPartners" DROP CONSTRAINT "_CompanyPartners_B_fkey";

-- DropTable
DROP TABLE "_CompanyPartners";

-- CreateTable
CREATE TABLE "company_partners" (
    "companyId" TEXT NOT NULL,
    "individualId" TEXT NOT NULL,
    "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT NOT NULL,

    CONSTRAINT "company_partners_pkey" PRIMARY KEY ("companyId","individualId")
);

-- AddForeignKey
ALTER TABLE "company_partners" ADD CONSTRAINT "company_partners_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_partners" ADD CONSTRAINT "company_partners_individualId_fkey" FOREIGN KEY ("individualId") REFERENCES "individuals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_partners" ADD CONSTRAINT "company_partners_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
