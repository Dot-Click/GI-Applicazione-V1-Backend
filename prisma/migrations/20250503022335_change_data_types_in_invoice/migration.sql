/*
  Warnings:

  - You are about to drop the column `Processed` on the `Invoice` table. All the data in the column will be lost.
  - The `taxAmt` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "Processed",
ADD COLUMN     "processed" "InvStatus" DEFAULT 'No',
DROP COLUMN "taxAmt",
ADD COLUMN     "taxAmt" DECIMAL(12,4);
