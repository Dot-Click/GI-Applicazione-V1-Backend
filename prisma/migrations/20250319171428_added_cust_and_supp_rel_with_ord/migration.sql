/*
  Warnings:

  - A unique constraint covering the columns `[id,companyName]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,companyName]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_supplierId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "supplierName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_id_companyName_key" ON "Customer"("id", "companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_id_companyName_key" ON "Supplier"("id", "companyName");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierId_supplierName_fkey" FOREIGN KEY ("supplierId", "supplierName") REFERENCES "Supplier"("id", "companyName") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_customerName_fkey" FOREIGN KEY ("customerId", "customerName") REFERENCES "Customer"("id", "companyName") ON DELETE SET NULL ON UPDATE CASCADE;
