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
CREATE TABLE "_CompanyPartners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_addressId_key" ON "companies"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyPartners_AB_unique" ON "_CompanyPartners"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyPartners_B_index" ON "_CompanyPartners"("B");

-- AddForeignKey
ALTER TABLE "individuals" ADD CONSTRAINT "individuals_companyAsEmployeeId_fkey" FOREIGN KEY ("companyAsEmployeeId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyPartners" ADD CONSTRAINT "_CompanyPartners_A_fkey" FOREIGN KEY ("A") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyPartners" ADD CONSTRAINT "_CompanyPartners_B_fkey" FOREIGN KEY ("B") REFERENCES "individuals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
