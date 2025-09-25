-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."DispatchStatus" ADD VALUE 'DISPATCHED';
ALTER TYPE "public"."DispatchStatus" ADD VALUE 'DELIVERED_TO_AIRPORT';
ALTER TYPE "public"."DispatchStatus" ADD VALUE 'CLOSED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."OrderStatus" ADD VALUE 'SUCCESS';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'EXCEPTION';

-- AlterTable
ALTER TABLE "public"."BatchDispatch" ADD COLUMN     "shipmentDate" DATE;

-- CreateTable
CREATE TABLE "public"."OrderScan" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "scannedBy" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batchId" TEXT,
    "notes" TEXT,
    "valid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OrderScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderScan_orderId_idx" ON "public"."OrderScan"("orderId");

-- CreateIndex
CREATE INDEX "OrderScan_batchId_idx" ON "public"."OrderScan"("batchId");

-- AddForeignKey
ALTER TABLE "public"."OrderScan" ADD CONSTRAINT "OrderScan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
