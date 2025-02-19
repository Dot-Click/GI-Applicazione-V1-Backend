/*
  Warnings:

  - You are about to drop the column `supplierName` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_supplierName_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "supplierName",
ADD COLUMN     "supplierEmail" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierEmail_fkey" FOREIGN KEY ("supplierEmail") REFERENCES "Supplier"("email") ON DELETE SET NULL ON UPDATE CASCADE;
