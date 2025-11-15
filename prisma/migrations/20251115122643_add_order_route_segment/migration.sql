-- CreateTable
CREATE TABLE "public"."OrderRouteSegment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT,
    "originId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "estimatedDurationMin" DOUBLE PRECISION,
    "actualDurationMin" DOUBLE PRECISION,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderRouteSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderRouteSegment_driverId_idx" ON "public"."OrderRouteSegment"("driverId");

-- CreateIndex
CREATE INDEX "OrderRouteSegment_orderId_idx" ON "public"."OrderRouteSegment"("orderId");

-- CreateIndex
CREATE INDEX "OrderRouteSegment_sequence_idx" ON "public"."OrderRouteSegment"("sequence");

-- AddForeignKey
ALTER TABLE "public"."OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_originId_fkey" FOREIGN KEY ("originId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRouteSegment" ADD CONSTRAINT "OrderRouteSegment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
