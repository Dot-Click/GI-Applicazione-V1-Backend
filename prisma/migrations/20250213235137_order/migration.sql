/*
  Warnings:

  - You are about to drop the column `constructionManager` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `projectManager` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobCode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `advancePayment` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobCode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobManager` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteManager` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('IN_DEPARTURE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "constructionManager",
DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "projectManager",
DROP COLUMN "state",
ADD COLUMN     "advancePayment" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "advanceRecovery" DOUBLE PRECISION,
ADD COLUMN     "cig" TEXT,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "cnceCode" TEXT,
ADD COLUMN     "contractAttachment" TEXT,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "cup" TEXT,
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobCode" TEXT NOT NULL,
ADD COLUMN     "jobManager" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "siteManager" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'IN_DEPARTURE',
ADD COLUMN     "vat" DOUBLE PRECISION,
ADD COLUMN     "withholdingAmount" DOUBLE PRECISION,
ADD COLUMN     "workAmount" DECIMAL(65,30) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_jobCode_key" ON "Order"("jobCode");
