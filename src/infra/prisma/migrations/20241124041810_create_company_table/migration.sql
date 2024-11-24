-- AlterTable
ALTER TABLE "individuals" ADD COLUMN     "companyAsEmployeeId" TEXT;

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "formalized" BOOLEAN NOT NULL,
    "cnpj" TEXT,
    "fantasyName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "addressId" TEXT NOT NULL,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "formalized_check" CHECK (
        NOT "formalized" OR (
            "cnpj" IS NOT NULL AND
            "email" IS NOT NULL AND
            "phoneNumber" IS NOT NULL
        )
    )
);

-- CreateTable
CREATE TABLE "company_partners" (
    "companyId" TEXT NOT NULL,
    "individualId" TEXT NOT NULL,
    "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT NOT NULL,

    CONSTRAINT "company_partners_pkey" PRIMARY KEY ("companyId","individualId")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_addressId_key" ON "companies"("addressId");

-- AddForeignKey
ALTER TABLE "individuals" ADD CONSTRAINT "individuals_companyAsEmployeeId_fkey" FOREIGN KEY ("companyAsEmployeeId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_partners" ADD CONSTRAINT "company_partners_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_partners" ADD CONSTRAINT "company_partners_individualId_fkey" FOREIGN KEY ("individualId") REFERENCES "individuals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_partners" ADD CONSTRAINT "company_partners_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
