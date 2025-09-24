-- CreateEnum
CREATE TYPE "public"."DispatchStatus" AS ENUM ('PENDING', 'READY', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "batchId" TEXT;

-- CreateTable
CREATE TABLE "public"."BatchDispatch" (
    "id" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "scope" "public"."ShippingScope" NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "category" TEXT,
    "isFragile" BOOLEAN NOT NULL DEFAULT false,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "public"."DispatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "BatchDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchDispatch_batchCode_key" ON "public"."BatchDispatch"("batchCode");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."BatchDispatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BatchDispatch" ADD CONSTRAINT "BatchDispatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
