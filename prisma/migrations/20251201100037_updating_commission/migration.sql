-- DropForeignKey
ALTER TABLE "TariffVehicleCommission" DROP CONSTRAINT "TariffVehicleCommission_vehicleCommissionId_fkey";

-- AlterTable
ALTER TABLE "TariffVehicleCommission" ADD COLUMN     "vehicleType" TEXT,
ALTER COLUMN "vehicleCommissionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TariffVehicleCommission" ADD CONSTRAINT "TariffVehicleCommission_vehicleCommissionId_fkey" FOREIGN KEY ("vehicleCommissionId") REFERENCES "VehicleCommission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
