-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "quantity" DOUBLE PRECISION,
ADD COLUMN     "receiverId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
