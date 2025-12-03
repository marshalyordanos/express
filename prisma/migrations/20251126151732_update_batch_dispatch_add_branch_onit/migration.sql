-- AlterTable
ALTER TABLE "BatchDispatch" ADD COLUMN     "destinationBranchId" TEXT,
ADD COLUMN     "originBranchId" TEXT;

-- AddForeignKey
ALTER TABLE "BatchDispatch" ADD CONSTRAINT "BatchDispatch_originBranchId_fkey" FOREIGN KEY ("originBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchDispatch" ADD CONSTRAINT "BatchDispatch_destinationBranchId_fkey" FOREIGN KEY ("destinationBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
