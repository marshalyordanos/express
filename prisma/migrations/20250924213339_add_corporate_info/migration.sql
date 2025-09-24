-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('INDIVIDUAL', 'CORPORATE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "customerType" "public"."CustomerType";

-- CreateTable
CREATE TABLE "public"."CorporateInfo" (
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "taxId" TEXT,
    "registrationNo" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "industryType" TEXT,
    "website" TEXT,
    "address" TEXT,
    "notes" TEXT,

    CONSTRAINT "CorporateInfo_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "public"."CorporateInfo" ADD CONSTRAINT "CorporateInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
