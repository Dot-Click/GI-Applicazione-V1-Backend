/*
  Warnings:

  - You are about to drop the column `supplierId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_supplierId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "supplierId",
ADD COLUMN     "supplierName" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierName_fkey" FOREIGN KEY ("supplierName") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
