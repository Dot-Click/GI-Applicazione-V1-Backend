/*
  Warnings:

  - You are about to alter the column `cig` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `cnceCode` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `cup` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `code` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "cig" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "cnceCode" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "cup" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(10);
