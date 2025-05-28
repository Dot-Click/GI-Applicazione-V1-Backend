/*
  Warnings:

  - Made the column `revAmt` on table `Costi` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Costi" ALTER COLUMN "note" DROP NOT NULL,
ALTER COLUMN "revAmt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ricavi" ALTER COLUMN "note" DROP NOT NULL;
