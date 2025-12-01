-- CreateTable
CREATE TABLE "WeightBracket" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "minKg" DOUBLE PRECISION NOT NULL,
    "maxKg" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightBracket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeightBracket" ADD CONSTRAINT "WeightBracket_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
