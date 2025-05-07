-- AlterTable
ALTER TABLE "Costi" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Ricavi" ADD COLUMN     "adminId" TEXT;

-- AddForeignKey
ALTER TABLE "Ricavi" ADD CONSTRAINT "Ricavi_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Costi" ADD CONSTRAINT "Costi_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
