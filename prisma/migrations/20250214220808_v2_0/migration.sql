/*
  Warnings:

  - You are about to drop the column `clientId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `VATNumber` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ateco` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cap` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `common` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nation` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pec` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxId` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telephone` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vat` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_clientId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "clientId",
ADD COLUMN     "customerId" TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "VATNumber",
DROP COLUMN "phone",
ADD COLUMN     "ateco" TEXT NOT NULL,
ADD COLUMN     "cap" TEXT NOT NULL,
ADD COLUMN     "common" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "nation" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "pec" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "taxId" TEXT NOT NULL,
ADD COLUMN     "telephone" TEXT NOT NULL,
ADD COLUMN     "vat" TEXT NOT NULL;

-- DropTable
DROP TABLE "Client";

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "vat" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "ateco" TEXT NOT NULL,
    "nation" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "common" TEXT NOT NULL,
    "cap" TEXT NOT NULL,
    "pec" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
