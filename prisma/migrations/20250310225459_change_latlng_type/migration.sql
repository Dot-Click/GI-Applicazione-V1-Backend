/*
  Warnings:

  - The `lat` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lng` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "lat",
ADD COLUMN     "lat" DOUBLE PRECISION DEFAULT 37.7749,
DROP COLUMN "lng",
ADD COLUMN     "lng" DOUBLE PRECISION DEFAULT -122.4194;
