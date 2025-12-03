/*
  Warnings:

  - You are about to drop the column `amount` on the `AirportNewFee` table. All the data in the column will be lost.
  - You are about to drop the column `tariffId` on the `AirportNewFee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[airportFeeId]` on the table `TariffServiceType` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AirportNewFee" DROP CONSTRAINT "AirportNewFee_tariffId_fkey";

-- DropIndex
DROP INDEX "AirportNewFee_tariffId_key";

-- AlterTable
ALTER TABLE "AirportNewFee" DROP COLUMN "amount",
DROP COLUMN "tariffId",
ADD COLUMN     "flatRatePerKg" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TariffServiceType" ADD COLUMN     "airportFeeId" TEXT;

-- CreateTable
CREATE TABLE "AirportFeeBracket" (
    "id" TEXT NOT NULL,
    "minKg" DOUBLE PRECISION NOT NULL,
    "maxKg" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "airportFeeId" TEXT NOT NULL,

    CONSTRAINT "AirportFeeBracket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TariffServiceType_airportFeeId_key" ON "TariffServiceType"("airportFeeId");

-- AddForeignKey
ALTER TABLE "TariffServiceType" ADD CONSTRAINT "TariffServiceType_airportFeeId_fkey" FOREIGN KEY ("airportFeeId") REFERENCES "AirportNewFee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirportFeeBracket" ADD CONSTRAINT "AirportFeeBracket_airportFeeId_fkey" FOREIGN KEY ("airportFeeId") REFERENCES "AirportNewFee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
