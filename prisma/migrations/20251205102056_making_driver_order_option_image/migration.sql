-- DropForeignKey
ALTER TABLE "PodImage" DROP CONSTRAINT "PodImage_driverId_fkey";

-- DropForeignKey
ALTER TABLE "PodImage" DROP CONSTRAINT "PodImage_orderId_fkey";

-- AlterTable
ALTER TABLE "PodImage" ALTER COLUMN "driverId" DROP NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PodImage" ADD CONSTRAINT "PodImage_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodImage" ADD CONSTRAINT "PodImage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
