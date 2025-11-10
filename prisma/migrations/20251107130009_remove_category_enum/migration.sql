/*
  Warnings:

  - The `category` column on the `BatchDispatch` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."BatchDispatch" DROP COLUMN "category",
ADD COLUMN     "category" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "public"."ParcelCategory";
