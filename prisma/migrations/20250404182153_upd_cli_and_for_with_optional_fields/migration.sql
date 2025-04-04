/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Made the column `code` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `code` on table `Supplier` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "Supplier_email_key";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "pec" DROP NOT NULL,
ALTER COLUMN "telephone" DROP NOT NULL,
ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "pec" DROP NOT NULL,
ALTER COLUMN "telephone" DROP NOT NULL,
ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");
