-- CreateEnum
CREATE TYPE "InvType" AS ENUM ('attive', 'passive');

-- CreateEnum
CREATE TYPE "InvStatus" AS ENUM ('Si', 'No');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "docNo" TEXT NOT NULL,
    "vat" TEXT,
    "name" TEXT,
    "taxAmt" TEXT,
    "docDate" DATE,
    "vatRate" DECIMAL(12,4) NOT NULL,
    "split" TEXT,
    "typology" TEXT,
    "Processed" "InvStatus" DEFAULT 'No',
    "type" "InvType" DEFAULT 'attive',
    "yearOfCompetence" TEXT,
    "protocol" TEXT,
    "attachment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ricavi" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "workSite" TEXT,
    "iva" TEXT,
    "wbs" TEXT,
    "note" TEXT NOT NULL,
    "invId" TEXT,
    "docDate" DATE,
    "yearOfCompetence" TEXT,
    "revAmt" DECIMAL(12,4) NOT NULL,
    "advancePayment" DECIMAL(12,4),
    "withHoldAmt" DECIMAL(12,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ricavi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_docNo_key" ON "Invoice"("docNo");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ricavi" ADD CONSTRAINT "Ricavi_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ricavi" ADD CONSTRAINT "Ricavi_invId_fkey" FOREIGN KEY ("invId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
