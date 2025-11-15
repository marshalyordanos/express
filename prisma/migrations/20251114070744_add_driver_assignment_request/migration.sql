-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "public"."DriverAssignmentRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdBy" TEXT,

    CONSTRAINT "DriverAssignmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverAssignmentRequest_orderId_idx" ON "public"."DriverAssignmentRequest"("orderId");

-- CreateIndex
CREATE INDEX "DriverAssignmentRequest_driverId_idx" ON "public"."DriverAssignmentRequest"("driverId");

-- CreateIndex
CREATE INDEX "DriverAssignmentRequest_status_idx" ON "public"."DriverAssignmentRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DriverAssignmentRequest_orderId_driverId_key" ON "public"."DriverAssignmentRequest"("orderId", "driverId");

-- AddForeignKey
ALTER TABLE "public"."DriverAssignmentRequest" ADD CONSTRAINT "DriverAssignmentRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverAssignmentRequest" ADD CONSTRAINT "DriverAssignmentRequest_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
