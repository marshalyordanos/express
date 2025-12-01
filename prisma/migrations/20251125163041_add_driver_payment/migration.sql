/*
  Warnings:

  - A unique constraint covering the columns `[driverPaymentId]` on the table `OrderRouteSegment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrderRouteSegment" ADD COLUMN     "driverPaymentId" TEXT;

-- CreateTable
CREATE TABLE "DriverPayment" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverPayment_driverId_idx" ON "DriverPayment"("driverId");

-- CreateIndex
CREATE INDEX "DriverPayment_orderId_idx" ON "DriverPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderRouteSegment_driverPaymentId_key" ON "OrderRouteSegment"("driverPaymentId");

-- AddForeignKey
ALTER TABLE "OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_driverPaymentId_fkey" FOREIGN KEY ("driverPaymentId") REFERENCES "DriverPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverPayment" ADD CONSTRAINT "DriverPayment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverPayment" ADD CONSTRAINT "DriverPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
