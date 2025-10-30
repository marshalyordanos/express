/*
  Warnings:

  - The `scope` column on the `RolePermission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."RolePermission" DROP COLUMN "scope",
ADD COLUMN     "scope" TEXT[] DEFAULT ARRAY[]::TEXT[];
