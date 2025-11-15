-- CreateEnum
CREATE TYPE "public"."DriverAvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'INTAKE', 'ENROUTE', 'BREAK', 'FULL');

-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "availablityStatus" "public"."DriverAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE';
