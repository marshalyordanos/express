/*
  Warnings:

  - The values [AVAILABLE,ENROUTE,BREAK,BUSY,INTAKE] on the enum `DriverStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DriverStatus_new" AS ENUM ('OFFLINE', 'ONLINE');
ALTER TABLE "public"."Driver" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Driver" ALTER COLUMN "status" TYPE "public"."DriverStatus_new" USING ("status"::text::"public"."DriverStatus_new");
ALTER TYPE "public"."DriverStatus" RENAME TO "DriverStatus_old";
ALTER TYPE "public"."DriverStatus_new" RENAME TO "DriverStatus";
DROP TYPE "public"."DriverStatus_old";
ALTER TABLE "public"."Driver" ALTER COLUMN "status" SET DEFAULT 'OFFLINE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "maxLoad" DOUBLE PRECISION DEFAULT 100;
