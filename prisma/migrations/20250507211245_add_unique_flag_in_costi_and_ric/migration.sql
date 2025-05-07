/*
  Warnings:

  - A unique constraint covering the columns `[docNo]` on the table `Costi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[docNo]` on the table `Ricavi` will be added. If there are existing duplicate values, this will fail.
  - Made the column `docNo` on table `Costi` required. This step will fail if there are existing NULL values in that column.
  - Made the column `docNo` on table `Ricavi` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Costi" ALTER COLUMN "docNo" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ricavi" ALTER COLUMN "docNo" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Costi_docNo_key" ON "Costi"("docNo");

-- CreateIndex
CREATE UNIQUE INDEX "Ricavi_docNo_key" ON "Ricavi"("docNo");
