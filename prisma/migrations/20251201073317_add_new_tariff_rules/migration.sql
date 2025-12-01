/*
  Warnings:

  - You are about to drop the `AirportFee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MiscFee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfitMargin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Surcharge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tariff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeightBracket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AirportFee" DROP CONSTRAINT "AirportFee_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "DiscountRule" DROP CONSTRAINT "DiscountRule_customerCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "DiscountRule" DROP CONSTRAINT "DiscountRule_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "MiscFee" DROP CONSTRAINT "MiscFee_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "ProfitMargin" DROP CONSTRAINT "ProfitMargin_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "Surcharge" DROP CONSTRAINT "Surcharge_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "Tariff" DROP CONSTRAINT "Tariff_customerCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "WeightBracket" DROP CONSTRAINT "WeightBracket_tariffId_fkey";

-- DropTable
DROP TABLE "AirportFee";

-- DropTable
DROP TABLE "DiscountRule";

-- DropTable
DROP TABLE "MiscFee";

-- DropTable
DROP TABLE "ProfitMargin";

-- DropTable
DROP TABLE "Surcharge";

-- DropTable
DROP TABLE "Tariff";

-- DropTable
DROP TABLE "WeightBracket";

-- CreateTable
CREATE TABLE "TariffGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shippingScope" "ShippingScope" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "TariffGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffServiceType" (
    "id" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "baseFee" DOUBLE PRECISION NOT NULL,
    "tariffId" TEXT NOT NULL,

    CONSTRAINT "TariffServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightBucket" (
    "id" TEXT NOT NULL,
    "startKg" DOUBLE PRECISION NOT NULL,
    "endKg" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "tariffId" TEXT NOT NULL,

    CONSTRAINT "WeightBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffVehicleCommission" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "vehicleCommissionId" TEXT NOT NULL,
    "fixed" DOUBLE PRECISION,
    "perKm" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TariffVehicleCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiscCharge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costPerKm" DOUBLE PRECISION,
    "flatFee" DOUBLE PRECISION,
    "tariffId" TEXT NOT NULL,

    CONSTRAINT "MiscCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirportNewFee" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tariffId" TEXT NOT NULL,

    CONSTRAINT "AirportNewFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfitNewMargin" (
    "id" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "tariffId" TEXT NOT NULL,

    CONSTRAINT "ProfitNewMargin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AirportNewFee_tariffId_key" ON "AirportNewFee"("tariffId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfitNewMargin_tariffId_key" ON "ProfitNewMargin"("tariffId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "TariffGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffServiceType" ADD CONSTRAINT "TariffServiceType_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "TariffGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightBucket" ADD CONSTRAINT "WeightBucket_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "TariffGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffVehicleCommission" ADD CONSTRAINT "TariffVehicleCommission_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "TariffGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffVehicleCommission" ADD CONSTRAINT "TariffVehicleCommission_vehicleCommissionId_fkey" FOREIGN KEY ("vehicleCommissionId") REFERENCES "VehicleCommission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiscCharge" ADD CONSTRAINT "MiscCharge_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "TariffGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirportNewFee" ADD CONSTRAINT "AirportNewFee_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "TariffGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitNewMargin" ADD CONSTRAINT "ProfitNewMargin_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "TariffGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
