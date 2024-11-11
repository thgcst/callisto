/*
  Warnings:

  - You are about to drop the column `addressId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `motherName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_addressId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_approvedById_fkey";

-- DropIndex
DROP INDEX "users_cpf_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "addressId",
DROP COLUMN "approvedAt",
DROP COLUMN "approvedById",
DROP COLUMN "birthday",
DROP COLUMN "cpf",
DROP COLUMN "motherName",
DROP COLUMN "phoneNumber",
DROP COLUMN "role",
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "password" DROP NOT NULL;

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "individuals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motherName" TEXT,
    "cpf" TEXT NOT NULL,
    "birthday" DATE NOT NULL,
    "phoneNumber" TEXT,
    "addressId" TEXT NOT NULL,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "individuals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "individuals_email_key" ON "individuals"("email");

-- CreateIndex
CREATE UNIQUE INDEX "individuals_cpf_key" ON "individuals"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "individuals_addressId_key" ON "individuals"("addressId");

-- AddForeignKey
ALTER TABLE "individuals" ADD CONSTRAINT "individuals_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individuals" ADD CONSTRAINT "individuals_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
