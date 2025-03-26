/*
  Warnings:

  - The `advancePayment` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endDate` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startDate` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `withholdingAmount` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workAmount` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dipositRecovery` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `iva` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "advancePayment",
ADD COLUMN     "advancePayment" DECIMAL(12,4),
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3),
DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3),
DROP COLUMN "withholdingAmount",
ADD COLUMN     "withholdingAmount" DECIMAL(12,4),
DROP COLUMN "workAmount",
ADD COLUMN     "workAmount" DECIMAL(12,4),
DROP COLUMN "dipositRecovery",
ADD COLUMN     "dipositRecovery" DECIMAL(12,4),
DROP COLUMN "iva",
ADD COLUMN     "iva" DECIMAL(12,4);
