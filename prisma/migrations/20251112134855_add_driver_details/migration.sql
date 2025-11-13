-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "licenseExpiry" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
