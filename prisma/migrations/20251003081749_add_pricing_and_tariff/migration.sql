-- CreateEnum
CREATE TYPE "public"."FeeType" AS ENUM ('PERCENTAGE', 'FLAT', 'PER_KG', 'PER_KM');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "currency" TEXT DEFAULT 'ETB',
ADD COLUMN     "distance" DOUBLE PRECISION,
ADD COLUMN     "finalPrice" DOUBLE PRECISION,
ADD COLUMN     "tariffId" TEXT;

-- AlterTable
ALTER TABLE "public"."Pricing" ADD COLUMN     "shippingScope" "public"."ShippingScope";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "customerCategoryId" TEXT;

-- CreateTable
CREATE TABLE "public"."Tariff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "baseFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "perKmRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "perKgRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shippingScope" "public"."ShippingScope",
    "customerCategoryId" TEXT,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfitMargin" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "serviceType" "public"."ServiceType",
    "shippingScope" "public"."ShippingScope",
    "percentage" DOUBLE PRECISION NOT NULL,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfitMargin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AirportFee" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "serviceType" "public"."ServiceType",
    "shippingScope" "public"."ShippingScope",
    "airportCode" TEXT NOT NULL,
    "perKgRate" DOUBLE PRECISION,
    "flatFee" DOUBLE PRECISION,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AirportFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MiscFee" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "serviceType" "public"."ServiceType",
    "shippingScope" "public"."ShippingScope",
    "name" TEXT NOT NULL,
    "description" TEXT,
    "feeType" "public"."FeeType",
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "condition" JSONB,
    "effectiveFrom" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiscFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Surcharge" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "serviceType" "public"."ServiceType",
    "shippingScope" "public"."ShippingScope",
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Surcharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountRule" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "shippingScope" "public"."ShippingScope",
    "serviceType" "public"."ServiceType",
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerCategoryId" TEXT,

    CONSTRAINT "DiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PricingRule" (
    "id" TEXT NOT NULL,
    "shippingScope" "public"."ShippingScope" NOT NULL,
    "customerCategoryId" TEXT,
    "adjustmentType" TEXT NOT NULL,
    "adjustmentValue" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriceCalculationLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "distance" DOUBLE PRECISION,
    "baseRate" DOUBLE PRECISION NOT NULL,
    "appliedRate" DOUBLE PRECISION NOT NULL,
    "surcharges" JSONB NOT NULL,
    "discounts" JSONB NOT NULL,
    "miscFees" JSONB NOT NULL,
    "profit" JSONB NOT NULL,
    "airportFee" JSONB,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceCalculationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_customerCategoryId_fkey" FOREIGN KEY ("customerCategoryId") REFERENCES "public"."CustomerCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "public"."Tariff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tariff" ADD CONSTRAINT "Tariff_customerCategoryId_fkey" FOREIGN KEY ("customerCategoryId") REFERENCES "public"."CustomerCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfitMargin" ADD CONSTRAINT "ProfitMargin_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "public"."Tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirportFee" ADD CONSTRAINT "AirportFee_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "public"."Tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MiscFee" ADD CONSTRAINT "MiscFee_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "public"."Tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Surcharge" ADD CONSTRAINT "Surcharge_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "public"."Tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountRule" ADD CONSTRAINT "DiscountRule_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "public"."Tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountRule" ADD CONSTRAINT "DiscountRule_customerCategoryId_fkey" FOREIGN KEY ("customerCategoryId") REFERENCES "public"."CustomerCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PricingRule" ADD CONSTRAINT "PricingRule_customerCategoryId_fkey" FOREIGN KEY ("customerCategoryId") REFERENCES "public"."CustomerCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriceCalculationLog" ADD CONSTRAINT "PriceCalculationLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
