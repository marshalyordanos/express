/*
  Warnings:

  - A unique constraint covering the columns `[latitude,longitude]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Location_longitude_latitude_idx";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "actualDeliveryAt" TIMESTAMP(3),
ADD COLUMN     "deliveryAssignedAt" TIMESTAMP(3),
ADD COLUMN     "deliveryAssignedBy" TEXT,
ADD COLUMN     "estimatedDeliveryAt" TIMESTAMP(3),
ADD COLUMN     "pickupAssignedAt" TIMESTAMP(3),
ADD COLUMN     "pickupAssignedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Location_latitude_longitude_key" ON "public"."Location"("latitude", "longitude");
