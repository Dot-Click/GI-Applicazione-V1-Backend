-- CreateTable
CREATE TABLE "Costi" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT,
    "iva" TEXT,
    "workSite" TEXT,
    "wbs" TEXT,
    "docDate" DATE,
    "yearOfCompetence" TEXT,
    "note" TEXT NOT NULL,
    "invId" TEXT,
    "revAmt" DECIMAL(12,4),
    "advancePayment" DECIMAL(12,4),
    "withHoldAmt" DECIMAL(12,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Costi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Costi" ADD CONSTRAINT "Costi_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Costi" ADD CONSTRAINT "Costi_invId_fkey" FOREIGN KEY ("invId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
