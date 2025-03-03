/*
  Warnings:

  - You are about to drop the column `supplierEmail` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_supplierEmail_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "supplierEmail",
ADD COLUMN     "supplierId" TEXT,
ALTER COLUMN "advancePayment" SET DATA TYPE TEXT,
ALTER COLUMN "workAmount" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
