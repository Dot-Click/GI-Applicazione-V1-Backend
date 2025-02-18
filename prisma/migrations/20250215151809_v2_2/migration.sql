/*
  Warnings:

  - The `role` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `Qualification` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractorNo` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipalityOfBirth` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameAndSurname` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sector` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surname` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "Qualification" TEXT NOT NULL,
ADD COLUMN     "contractorNo" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "level" TEXT NOT NULL,
ADD COLUMN     "municipalityOfBirth" TEXT NOT NULL,
ADD COLUMN     "nameAndSurname" TEXT NOT NULL,
ADD COLUMN     "sector" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "surname" TEXT NOT NULL,
ADD COLUMN     "taxId" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adminId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
