/*
  Warnings:

  - You are about to drop the column `tariffId` on the `MiscCharge` table. All the data in the column will be lost.
  - You are about to drop the column `tariffId` on the `WeightBucket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MiscCharge" DROP CONSTRAINT "MiscCharge_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "WeightBucket" DROP CONSTRAINT "WeightBucket_tariffId_fkey";

-- AlterTable
ALTER TABLE "MiscCharge" DROP COLUMN "tariffId";

-- AlterTable
ALTER TABLE "WeightBucket" DROP COLUMN "tariffId";
