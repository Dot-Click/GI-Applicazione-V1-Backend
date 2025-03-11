/*
  Warnings:

  - The `isPublic` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `archieved` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "isPublic",
ADD COLUMN     "isPublic" BOOLEAN DEFAULT false,
DROP COLUMN "archieved",
ADD COLUMN     "archieved" BOOLEAN DEFAULT false;
