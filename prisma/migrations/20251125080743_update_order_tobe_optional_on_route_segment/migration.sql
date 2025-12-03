-- DropForeignKey
ALTER TABLE "OrderRouteSegment" DROP CONSTRAINT "OrderRouteSegment_orderId_fkey";

-- AlterTable
ALTER TABLE "OrderRouteSegment" ALTER COLUMN "orderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
