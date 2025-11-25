/*
  Warnings:

  - You are about to drop the column `destinationId` on the `OrderRouteSegment` table. All the data in the column will be lost.
  - You are about to drop the column `destinationLat` on the `OrderRouteSegment` table. All the data in the column will be lost.
  - You are about to drop the column `destinationLon` on the `OrderRouteSegment` table. All the data in the column will be lost.
  - You are about to drop the column `distanceKm` on the `OrderRouteSegment` table. All the data in the column will be lost.
  - You are about to drop the column `originId` on the `OrderRouteSegment` table. All the data in the column will be lost.
  - You are about to drop the column `originLat` on the `OrderRouteSegment` table. All the data in the column will be lost.
  - You are about to drop the column `originLon` on the `OrderRouteSegment` table. All the data in the column will be lost.
  - Added the required column `fromType` to the `OrderRouteSegment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segmentType` to the `OrderRouteSegment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toType` to the `OrderRouteSegment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SegmentType" AS ENUM ('TO_PICKUP', 'PICKUP_TO_BRANCH', 'PICKUP_TO_DELIVERY', 'PICKUP_TO_PICKUP', 'BRANCH_TO_DELIVERY', 'BRANCH_TO_PICKUP', 'BRANCH_TO_BRANCH', 'DELIVERY_TO_DELIVERY', 'DELIVERY_TO_PICKUP', 'RETURN_TO_BRANCH', 'IDLE_WAITING');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('DRIVER_LOCATION', 'PICKUP_ADDRESS', 'DELIVERY_ADDRESS', 'BRANCH');

-- CreateEnum
CREATE TYPE "SegmentStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'FAILED');

-- DropForeignKey
ALTER TABLE "OrderRouteSegment" DROP CONSTRAINT "OrderRouteSegment_destinationId_fkey";

-- DropForeignKey
ALTER TABLE "OrderRouteSegment" DROP CONSTRAINT "OrderRouteSegment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderRouteSegment" DROP CONSTRAINT "OrderRouteSegment_originId_fkey";

-- DropIndex
DROP INDEX "OrderRouteSegment_driverId_idx";

-- DropIndex
DROP INDEX "OrderRouteSegment_orderId_idx";

-- DropIndex
DROP INDEX "OrderRouteSegment_sequence_idx";

-- AlterTable
ALTER TABLE "OrderRouteSegment" DROP COLUMN "destinationId",
DROP COLUMN "destinationLat",
DROP COLUMN "destinationLon",
DROP COLUMN "distanceKm",
DROP COLUMN "originId",
DROP COLUMN "originLat",
DROP COLUMN "originLon",
ADD COLUMN     "actualDistanceKm" DOUBLE PRECISION,
ADD COLUMN     "estimatedDistanceKm" DOUBLE PRECISION,
ADD COLUMN     "fromLat" DOUBLE PRECISION,
ADD COLUMN     "fromLon" DOUBLE PRECISION,
ADD COLUMN     "fromType" "LocationType" NOT NULL,
ADD COLUMN     "segmentType" "SegmentType" NOT NULL,
ADD COLUMN     "status" "SegmentStatus" NOT NULL DEFAULT 'PLANNED',
ADD COLUMN     "toLat" DOUBLE PRECISION,
ADD COLUMN     "toLon" DOUBLE PRECISION,
ADD COLUMN     "toType" "LocationType" NOT NULL,
ALTER COLUMN "sequence" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "OrderRouteSegment_driverId_startTime_idx" ON "OrderRouteSegment"("driverId", "startTime");

-- CreateIndex
CREATE INDEX "OrderRouteSegment_status_idx" ON "OrderRouteSegment"("status");

-- AddForeignKey
ALTER TABLE "OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
