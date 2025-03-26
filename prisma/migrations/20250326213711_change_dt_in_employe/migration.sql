/*
  Warnings:

  - The `endDate` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startDate` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "endDate",
ADD COLUMN     "endDate" DATE,
DROP COLUMN "startDate",
ADD COLUMN     "startDate" DATE;
