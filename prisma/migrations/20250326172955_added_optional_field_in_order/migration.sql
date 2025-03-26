/*
  Warnings:

  - You are about to drop the column `vat` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "vat",
ALTER COLUMN "advancePayment" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "withholdingAmount" DROP NOT NULL,
ALTER COLUMN "workAmount" DROP NOT NULL,
ALTER COLUMN "dipositRecovery" DROP NOT NULL,
ALTER COLUMN "iva" DROP NOT NULL;
