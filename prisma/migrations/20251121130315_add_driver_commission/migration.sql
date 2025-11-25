-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTORCYCLE', 'SCOOTER', 'BAJAJ', 'CAR', 'VAN', 'TRUCK', 'CARGO_CAR', 'AUTOMOBILE', 'BICYCLE');

-- CreateTable
CREATE TABLE "DriverCommission" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "commissionType" "CommissionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "vehicleType" "VehicleType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DriverCommission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverCommission_driverId_idx" ON "DriverCommission"("driverId");

-- CreateIndex
CREATE INDEX "DriverCommission_commissionType_idx" ON "DriverCommission"("commissionType");

-- CreateIndex
CREATE INDEX "DriverCommission_vehicleType_idx" ON "DriverCommission"("vehicleType");

-- CreateIndex
CREATE INDEX "DriverCommission_isActive_idx" ON "DriverCommission"("isActive");

-- CreateIndex
CREATE INDEX "DriverCommission_effectiveFrom_idx" ON "DriverCommission"("effectiveFrom");

-- AddForeignKey
ALTER TABLE "DriverCommission" ADD CONSTRAINT "DriverCommission_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
