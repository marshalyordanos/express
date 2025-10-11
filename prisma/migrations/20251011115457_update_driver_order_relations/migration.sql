/*
  Warnings:

  - You are about to drop the column `driverId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_driver_fk_driver";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_driver_fk_user";

-- DropIndex
DROP INDEX "public"."Order_driverId_idx";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "driverId",
ADD COLUMN     "deliveryDriverId" TEXT,
ADD COLUMN     "pickupDriverId" TEXT;

-- CreateIndex
CREATE INDEX "Order_pickupDriverId_idx" ON "public"."Order"("pickupDriverId");

-- CreateIndex
CREATE INDEX "Order_deliveryDriverId_idx" ON "public"."Order"("deliveryDriverId");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_pickupDriverId_fkey" FOREIGN KEY ("pickupDriverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_deliveryDriverId_fkey" FOREIGN KEY ("deliveryDriverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
