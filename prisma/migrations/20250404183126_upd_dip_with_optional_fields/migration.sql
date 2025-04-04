/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nameAndsurname` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `code` on table `Employee` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Employee_email_key";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "contractorNo" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'Technical_Manager',
ALTER COLUMN "nameAndsurname" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_code_key" ON "Employee"("code");
