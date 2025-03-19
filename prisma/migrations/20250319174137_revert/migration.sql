/*
  Warnings:

  - You are about to drop the column `customerName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `supplierName` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_customerName_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_supplierId_supplierName_fkey";

-- DropIndex
DROP INDEX "Customer_id_companyName_key";

-- DropIndex
DROP INDEX "Supplier_id_companyName_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerName",
DROP COLUMN "supplierName";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
