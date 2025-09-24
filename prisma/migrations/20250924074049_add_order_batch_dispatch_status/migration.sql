-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."DispatchStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "public"."DispatchStatus" ADD VALUE 'COLLECTED';
ALTER TYPE "public"."DispatchStatus" ADD VALUE 'PICKEDUP';
ALTER TYPE "public"."DispatchStatus" ADD VALUE 'ARRIVED_AT_DESTINATION';
ALTER TYPE "public"."DispatchStatus" ADD VALUE 'OUT_FOR_BRANCH_TRANSFER';
ALTER TYPE "public"."DispatchStatus" ADD VALUE 'AT_BRANCH';
ALTER TYPE "public"."DispatchStatus" ADD VALUE 'OUT_FOR_DELIVERY';

-- AlterTable
ALTER TABLE "public"."BatchDispatch" ADD COLUMN     "officerId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."BatchDispatch" ADD CONSTRAINT "BatchDispatch_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
