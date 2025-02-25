/*
  Warnings:

  - You are about to drop the column `ateco` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `cap` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `common` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `nation` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `cap` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `common` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `contractAttachment` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercentage` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `nation` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `Order` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ateco` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `cap` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `common` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `nation` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `Supplier` table. All the data in the column will be lost.
  - Made the column `cnceCode` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive', 'pending', 'ongoing', 'completed');

-- AlterEnum
ALTER TYPE "EmpRole" ADD VALUE 'Technical_Manager';

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "ateco",
DROP COLUMN "cap",
DROP COLUMN "common",
DROP COLUMN "nation",
DROP COLUMN "province",
ADD COLUMN     "status" "Status" DEFAULT 'active';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cap",
DROP COLUMN "common",
DROP COLUMN "contractAttachment",
DROP COLUMN "discountPercentage",
DROP COLUMN "nation",
DROP COLUMN "province",
ALTER COLUMN "cnceCode" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" DEFAULT 'active';

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "ateco",
DROP COLUMN "cap",
DROP COLUMN "common",
DROP COLUMN "nation",
DROP COLUMN "province",
ADD COLUMN     "status" "Status" DEFAULT 'active';

-- DropEnum
DROP TYPE "State";
