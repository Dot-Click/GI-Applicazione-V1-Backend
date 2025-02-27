/*
  Warnings:

  - You are about to drop the column `contratto` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "contratto",
ADD COLUMN     "contract" TEXT;
