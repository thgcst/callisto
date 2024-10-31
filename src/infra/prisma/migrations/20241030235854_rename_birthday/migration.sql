/*
  Warnings:

  - You are about to drop the column `country` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `users` table. All the data in the column will be lost.
  - Added the required column `birthday` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `addressId` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_addressId_fkey";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "country";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "dateOfBirth",
ADD COLUMN     "birthday" DATE NOT NULL,
ALTER COLUMN "addressId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
