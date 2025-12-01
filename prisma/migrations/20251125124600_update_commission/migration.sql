/*
  Warnings:

  - You are about to drop the column `type` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `DriverCommission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DriverCommission" DROP CONSTRAINT "DriverCommission_driverId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "type",
ADD COLUMN     "vehicleTypeId" TEXT;

-- DropTable
DROP TABLE "DriverCommission";

-- DropEnum
DROP TYPE "VehicleType";

-- CreateTable
CREATE TABLE "VehicleCommission" (
    "id" TEXT NOT NULL,
    "vehicleTypeId" TEXT NOT NULL,
    "commissionType" "CommissionType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VehicleCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleCommission_vehicleTypeId_idx" ON "VehicleCommission"("vehicleTypeId");

-- CreateIndex
CREATE INDEX "VehicleCommission_commissionType_idx" ON "VehicleCommission"("commissionType");

-- CreateIndex
CREATE INDEX "VehicleCommission_isActive_idx" ON "VehicleCommission"("isActive");

-- CreateIndex
CREATE INDEX "VehicleCommission_effectiveFrom_idx" ON "VehicleCommission"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleType_name_key" ON "VehicleType"("name");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCommission" ADD CONSTRAINT "VehicleCommission_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
