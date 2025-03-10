/*
  Warnings:

  - A unique constraint covering the columns `[seqId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "seqId" TEXT;

-- CreateTable
CREATE TABLE "ordSequence" (
    "id" TEXT NOT NULL,
    "added_col_array" TEXT[],
    "visible_col_array" TEXT[],

    CONSTRAINT "ordSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_seqId_key" ON "Admin"("seqId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_seqId_fkey" FOREIGN KEY ("seqId") REFERENCES "ordSequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
