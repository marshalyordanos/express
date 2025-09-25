-- CreateTable
CREATE TABLE "public"."BatchHandover" (
    "id" TEXT NOT NULL,
    "handedById" TEXT NOT NULL,
    "handedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "reference" TEXT,
    "notes" TEXT,

    CONSTRAINT "BatchHandover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_HandoverBatches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_HandoverBatches_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_HandoverBatches_B_index" ON "public"."_HandoverBatches"("B");

-- AddForeignKey
ALTER TABLE "public"."BatchHandover" ADD CONSTRAINT "BatchHandover_handedById_fkey" FOREIGN KEY ("handedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HandoverBatches" ADD CONSTRAINT "_HandoverBatches_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."BatchDispatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HandoverBatches" ADD CONSTRAINT "_HandoverBatches_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."BatchHandover"("id") ON DELETE CASCADE ON UPDATE CASCADE;
