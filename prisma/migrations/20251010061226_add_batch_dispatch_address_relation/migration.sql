/*
  Warnings:

  - You are about to drop the column `destination` on the `BatchDispatch` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `BatchDispatch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."BatchDispatch" DROP COLUMN "destination",
DROP COLUMN "origin",
ADD COLUMN     "destinationId" TEXT,
ADD COLUMN     "originId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."BatchDispatch" ADD CONSTRAINT "BatchDispatch_originId_fkey" FOREIGN KEY ("originId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BatchDispatch" ADD CONSTRAINT "BatchDispatch_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
