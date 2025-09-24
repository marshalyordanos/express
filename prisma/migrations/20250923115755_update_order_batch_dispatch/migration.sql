-- AlterTable
ALTER TABLE "public"."BatchDispatch" ADD COLUMN     "awbNumber" TEXT,
ADD COLUMN     "driverId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "vehicleId" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "public"."BatchDispatch" ADD CONSTRAINT "BatchDispatch_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BatchDispatch" ADD CONSTRAINT "BatchDispatch_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
