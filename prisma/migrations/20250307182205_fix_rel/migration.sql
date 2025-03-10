/*
  Warnings:

  - You are about to drop the column `seqId` on the `Admin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[adminId]` on the table `ordSequence` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_seqId_fkey";

-- DropIndex
DROP INDEX "Admin_seqId_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "seqId";

-- AlterTable
ALTER TABLE "ordSequence" ADD COLUMN     "adminId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ordSequence_adminId_key" ON "ordSequence"("adminId");

-- AddForeignKey
ALTER TABLE "ordSequence" ADD CONSTRAINT "ordSequence_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
