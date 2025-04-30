/*
  Warnings:

  - A unique constraint covering the columns `[custCode,ordCode]` on the table `Accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Accounts" DROP CONSTRAINT "Accounts_suppCode_fkey";

-- AlterTable
ALTER TABLE "Accounts" ADD COLUMN     "custCode" TEXT,
ADD COLUMN     "see_CDP" TEXT,
ALTER COLUMN "suppCode" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CDP" (
    "id" TEXT NOT NULL,
    "iva" DECIMAL(10,4),
    "currentWorkAmountSubjectToReduction" DECIMAL(10,4),
    "currentWorkAmountNotSubjectToDiscount" DECIMAL(10,4),
    "add_additional_1" TEXT,
    "desc_additional_1" TEXT,
    "add_additional_2" TEXT,
    "desc_additional_2" TEXT,
    "add_additional_3" TEXT,
    "desc_additional_3" TEXT,
    "reducedAmount" DECIMAL(10,4),
    "accId" TEXT,
    "currentWorksAmount" DECIMAL(10,4),
    "advPayment" DECIMAL(10,4),
    "withholdingTax" DECIMAL(10,4),
    "amtPresentCDP" DECIMAL(10,4),
    "vat" DECIMAL(10,4),
    "totalAmount" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CDP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_custCode_ordCode_key" ON "Accounts"("custCode", "ordCode");

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_suppCode_fkey" FOREIGN KEY ("suppCode") REFERENCES "Supplier"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_custCode_fkey" FOREIGN KEY ("custCode") REFERENCES "Customer"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CDP" ADD CONSTRAINT "CDP_accId_fkey" FOREIGN KEY ("accId") REFERENCES "Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
