/*
  Warnings:

  - You are about to drop the column `advanceRecovery` on the `Order` table. All the data in the column will be lost.
  - Added the required column `cap` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `common` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dipositRecovery` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iva` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nation` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `cig` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contractAttachment` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cup` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `discountPercentage` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `withholdingAmount` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "advanceRecovery",
ADD COLUMN     "cap" TEXT NOT NULL,
ADD COLUMN     "common" TEXT NOT NULL,
ADD COLUMN     "dipositRecovery" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "iva" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "nation" TEXT NOT NULL,
ALTER COLUMN "cig" SET NOT NULL,
ALTER COLUMN "contractAttachment" SET NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "cup" SET NOT NULL,
ALTER COLUMN "discountPercentage" SET NOT NULL,
ALTER COLUMN "withholdingAmount" SET NOT NULL;
