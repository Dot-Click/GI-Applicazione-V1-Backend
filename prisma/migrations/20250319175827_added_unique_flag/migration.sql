/*
  Warnings:

  - A unique constraint covering the columns `[companyName]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyName]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_companyName_key" ON "Customer"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_companyName_key" ON "Supplier"("companyName");
