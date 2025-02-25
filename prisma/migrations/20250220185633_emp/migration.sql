/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'Visualizzatore';
ALTER TYPE "Role" ADD VALUE 'Editor';
ALTER TYPE "Role" ADD VALUE 'Ospite';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "natureContract" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
