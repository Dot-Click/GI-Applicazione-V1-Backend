/*
  Warnings:

  - You are about to drop the column `jobCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `jobDescription` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `jobManager` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderManager` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Order_jobCode_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "jobCode",
DROP COLUMN "jobDescription",
DROP COLUMN "jobManager",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "orderManager" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");
