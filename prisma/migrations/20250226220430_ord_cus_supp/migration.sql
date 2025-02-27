/*
  Warnings:

  - You are about to drop the column `permesso_a_costruire` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "permesso_a_costruire",
ADD COLUMN     "permission_to_build" TEXT;
