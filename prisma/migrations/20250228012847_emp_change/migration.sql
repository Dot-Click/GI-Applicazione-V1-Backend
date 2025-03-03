/*
  Warnings:

  - You are about to drop the column `formazone` on the `Formazone` table. All the data in the column will be lost.
  - Added the required column `training` to the `Formazone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Formazone" DROP COLUMN "formazone",
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "training" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Seritia" ADD COLUMN     "employeeId" TEXT;

-- AlterTable
ALTER TABLE "Unilav" ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "Unilav" ADD CONSTRAINT "Unilav_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seritia" ADD CONSTRAINT "Seritia_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formazone" ADD CONSTRAINT "Formazone_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
