-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "backImageUrl" TEXT,
ADD COLUMN     "frontImageUrl" TEXT,
ADD COLUMN     "licenseIssue" TIMESTAMP(3),
ADD COLUMN     "verifiedByOCR" BOOLEAN NOT NULL DEFAULT false;
