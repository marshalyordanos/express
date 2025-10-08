/*
  Warnings:

  - You are about to drop the column `deliveryAddress` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pickupAddress` on the `Order` table. All the data in the column will be lost.
  - Added the required column `purpose` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DriverStatus" AS ENUM ('OFFLINE', 'AVAILABLE', 'ENROUTE', 'BREAK');

-- CreateEnum
CREATE TYPE "public"."DriverType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "public"."AddressPurpose" AS ENUM ('USER_HOME', 'USER_WORK', 'ORDER_PICKUP', 'ORDER_DELIVERY');

-- CreateEnum
CREATE TYPE "public"."CongestionLevel" AS ENUM ('FREE', 'LIGHT', 'MEDIUM', 'HEAVY');

-- CreateEnum
CREATE TYPE "public"."OptimizationType" AS ENUM ('SINGLE_ROUTE', 'MULTI_STOP');

-- CreateEnum
CREATE TYPE "public"."OptimizationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "public"."Vehicle" DROP CONSTRAINT "Vehicle_driverId_fkey";

-- AlterTable
ALTER TABLE "public"."Address" ADD COLUMN     "purpose" "public"."AddressPurpose" NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "deliveryAddress",
DROP COLUMN "pickupAddress",
ADD COLUMN     "deliveryAddressId" TEXT,
ADD COLUMN     "optimizationJobId" TEXT,
ADD COLUMN     "pickupAddressId" TEXT;

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Route" (
    "id" TEXT NOT NULL,
    "originId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "durationMin" DOUBLE PRECISION,
    "routePath" JSONB,
    "optimized" BOOLEAN NOT NULL DEFAULT false,
    "trafficAware" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OptimizationJob" (
    "id" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "type" "public"."OptimizationType" NOT NULL,
    "status" "public"."OptimizationStatus" NOT NULL DEFAULT 'PENDING',
    "totalDistance" DOUBLE PRECISION,
    "totalDuration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "optimizedOrder" JSONB,
    "batchId" TEXT,
    "driverId" TEXT,

    CONSTRAINT "OptimizationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "status" "public"."DriverStatus" NOT NULL DEFAULT 'OFFLINE',
    "type" "public"."DriverType" NOT NULL DEFAULT 'INTERNAL',
    "currentLat" DOUBLE PRECISION,
    "currentLon" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverLocationLog" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverLocationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrafficCondition" (
    "id" TEXT NOT NULL,
    "routeId" TEXT,
    "optimizationJobId" TEXT,
    "roadName" TEXT NOT NULL,
    "congestionLevel" "public"."CongestionLevel" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),

    CONSTRAINT "TrafficCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RouteOptimizations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RouteOptimizations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Location_latitude_idx" ON "public"."Location"("latitude");

-- CreateIndex
CREATE INDEX "Location_longitude_idx" ON "public"."Location"("longitude");

-- CreateIndex
CREATE INDEX "Location_longitude_latitude_idx" ON "public"."Location"("longitude", "latitude");

-- CreateIndex
CREATE INDEX "Route_originId_idx" ON "public"."Route"("originId");

-- CreateIndex
CREATE INDEX "Route_destinationId_idx" ON "public"."Route"("destinationId");

-- CreateIndex
CREATE INDEX "Route_originId_destinationId_idx" ON "public"."Route"("originId", "destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "OptimizationJob_jobCode_key" ON "public"."OptimizationJob"("jobCode");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "public"."Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_userId_idx" ON "public"."Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_vehicleId_idx" ON "public"."Driver"("vehicleId");

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "public"."Driver"("status");

-- CreateIndex
CREATE INDEX "Driver_type_idx" ON "public"."Driver"("type");

-- CreateIndex
CREATE INDEX "DriverLocationLog_driverId_idx" ON "public"."DriverLocationLog"("driverId");

-- CreateIndex
CREATE INDEX "DriverLocationLog_timestamp_idx" ON "public"."DriverLocationLog"("timestamp");

-- CreateIndex
CREATE INDEX "_RouteOptimizations_B_index" ON "public"."_RouteOptimizations"("B");

-- CreateIndex
CREATE INDEX "idx_address_coords" ON "public"."Address"("lat", "long");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "public"."Address"("userId");

-- CreateIndex
CREATE INDEX "Address_purpose_idx" ON "public"."Address"("purpose");

-- CreateIndex
CREATE INDEX "idx_order_addresses" ON "public"."Order"("pickupAddressId", "deliveryAddressId");

-- CreateIndex
CREATE INDEX "idx_branch_status" ON "public"."Order"("branchId", "status");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "public"."Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_branchId_idx" ON "public"."Order"("branchId");

-- CreateIndex
CREATE INDEX "Order_driverId_idx" ON "public"."Order"("driverId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "Order_serviceType_idx" ON "public"."Order"("serviceType");

-- CreateIndex
CREATE INDEX "Order_fulfillmentType_idx" ON "public"."Order"("fulfillmentType");

-- CreateIndex
CREATE INDEX "Order_isFragile_idx" ON "public"."Order"("isFragile");

-- CreateIndex
CREATE INDEX "Order_shipmentType_idx" ON "public"."Order"("shipmentType");

-- CreateIndex
CREATE INDEX "Order_shippingScope_idx" ON "public"."Order"("shippingScope");

-- CreateIndex
CREATE INDEX "Order_pickupAddressId_idx" ON "public"."Order"("pickupAddressId");

-- CreateIndex
CREATE INDEX "Order_deliveryAddressId_idx" ON "public"."Order"("deliveryAddressId");

-- CreateIndex
CREATE INDEX "Order_validatedBy_idx" ON "public"."Order"("validatedBy");

-- CreateIndex
CREATE INDEX "Order_batchId_idx" ON "public"."Order"("batchId");

-- CreateIndex
CREATE INDEX "Order_tariffId_idx" ON "public"."Order"("tariffId");

-- CreateIndex
CREATE INDEX "Order_optimizationJobId_idx" ON "public"."Order"("optimizationJobId");

-- CreateIndex
CREATE INDEX "OrderTracking_updatedBy_idx" ON "public"."OrderTracking"("updatedBy");

-- CreateIndex
CREATE INDEX "ParcelApproval_decisionBy_idx" ON "public"."ParcelApproval"("decisionBy");

-- CreateIndex
CREATE INDEX "User_isStaff_idx" ON "public"."User"("isStaff");

-- CreateIndex
CREATE INDEX "User_branchId_idx" ON "public"."User"("branchId");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "public"."User"("roleId");

-- CreateIndex
CREATE INDEX "User_customerCategoryId_idx" ON "public"."User"("customerCategoryId");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "public"."Vehicle"("status");

-- CreateIndex
CREATE INDEX "Vehicle_driverId_idx" ON "public"."Vehicle"("driverId");

-- RenameForeignKey
ALTER TABLE "public"."Order" RENAME CONSTRAINT "Order_driverId_fkey" TO "Order_driver_fk_user";

-- AddForeignKey
ALTER TABLE "public"."Vehicle" ADD CONSTRAINT "Vehicle_driver_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_pickupAddressId_fkey" FOREIGN KEY ("pickupAddressId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_optimizationJobId_fkey" FOREIGN KEY ("optimizationJobId") REFERENCES "public"."OptimizationJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_driver_fk_driver" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Route" ADD CONSTRAINT "Route_originId_fkey" FOREIGN KEY ("originId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Route" ADD CONSTRAINT "Route_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptimizationJob" ADD CONSTRAINT "OptimizationJob_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."BatchDispatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptimizationJob" ADD CONSTRAINT "OptimizationJob_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverLocationLog" ADD CONSTRAINT "DriverLocationLog_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrafficCondition" ADD CONSTRAINT "TrafficCondition_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrafficCondition" ADD CONSTRAINT "TrafficCondition_optimizationJobId_fkey" FOREIGN KEY ("optimizationJobId") REFERENCES "public"."OptimizationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RouteOptimizations" ADD CONSTRAINT "_RouteOptimizations_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."OptimizationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RouteOptimizations" ADD CONSTRAINT "_RouteOptimizations_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
