-- AlterTable
ALTER TABLE "public"."Address" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."AirportFee" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."AuditLog" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."BatchDispatch" ADD COLUMN     "createdUser" TEXT;

-- AlterTable
ALTER TABLE "public"."BatchHandover" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Bookmark" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Bookmark2" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Branch" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."CorporateInfo" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."CustomerCategory" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."DiscountRule" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."DriverLocationLog" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."EmailVerification" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."FleetLog" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Location" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Mfa" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."MiscFee" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."OptimizationJob" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."OrderException" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."OrderScan" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."OrderTracking" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."ParcelApproval" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Permission" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."PriceCalculationLog" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Pricing" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."PricingRule" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."ProfitMargin" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Role" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."RolePermission" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Route" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Surcharge" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Tariff" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."TrafficCondition" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."UserPreferences" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "createdBy" TEXT;
