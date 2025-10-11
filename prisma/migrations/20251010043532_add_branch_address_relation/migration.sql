/*
  Warnings:

  - A unique constraint covering the columns `[branchId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."AddressPurpose" ADD VALUE 'BRANCH_LOCATION';

-- AlterTable
ALTER TABLE "public"."Address" ADD COLUMN     "branchId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Address_branchId_key" ON "public"."Address"("branchId");

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
