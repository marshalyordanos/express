-- DropForeignKey
ALTER TABLE "OrderRouteSegment" DROP CONSTRAINT "OrderRouteSegment_destinationId_fkey";

-- DropForeignKey
ALTER TABLE "OrderRouteSegment" DROP CONSTRAINT "OrderRouteSegment_originId_fkey";

-- AlterTable
ALTER TABLE "OrderRouteSegment" ADD COLUMN     "destinationLat" DOUBLE PRECISION,
ADD COLUMN     "destinationLon" DOUBLE PRECISION,
ADD COLUMN     "originLat" DOUBLE PRECISION,
ADD COLUMN     "originLon" DOUBLE PRECISION,
ALTER COLUMN "originId" DROP NOT NULL,
ALTER COLUMN "destinationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
