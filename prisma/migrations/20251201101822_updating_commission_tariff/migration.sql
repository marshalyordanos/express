/*
  Warnings:

  - You are about to drop the column `vehicleCommissionId` on the `TariffVehicleCommission` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleType` on the `TariffVehicleCommission` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleTypeId` on the `VehicleCommission` table. All the data in the column will be lost.
  - Added the required column `vehicleTypeId` to the `TariffVehicleCommission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TariffVehicleCommission" DROP CONSTRAINT "TariffVehicleCommission_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "TariffVehicleCommission" DROP CONSTRAINT "TariffVehicleCommission_vehicleCommissionId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleCommission" DROP CONSTRAINT "VehicleCommission_vehicleTypeId_fkey";

-- DropIndex
DROP INDEX "VehicleCommission_vehicleTypeId_idx";

-- AlterTable
ALTER TABLE "TariffVehicleCommission" DROP COLUMN "vehicleCommissionId",
DROP COLUMN "vehicleType",
ADD COLUMN     "vehicleTypeId" TEXT NOT NULL,
ALTER COLUMN "tariffId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VehicleCommission" DROP COLUMN "vehicleTypeId";

-- AddForeignKey
ALTER TABLE "TariffVehicleCommission" ADD CONSTRAINT "TariffVehicleCommission_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "TariffGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffVehicleCommission" ADD CONSTRAINT "TariffVehicleCommission_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
