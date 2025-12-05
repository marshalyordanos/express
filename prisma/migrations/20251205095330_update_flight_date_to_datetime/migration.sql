/*
  Warnings:

  - The `destinationTime` column on the `BatchHandover` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flightDate` column on the `BatchHandover` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BatchHandover" DROP COLUMN "destinationTime",
ADD COLUMN     "destinationTime" TIMESTAMP(3),
DROP COLUMN "flightDate",
ADD COLUMN     "flightDate" TIMESTAMP(3);
