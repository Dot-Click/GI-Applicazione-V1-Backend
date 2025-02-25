/*
  Warnings:

  - The values [Training,Unified_Labour_Notification,Fitness] on the enum `EmpRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderState" AS ENUM ('IN_DEPARTURE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "EmpRole_new" AS ENUM ('Admin', 'Technical_Manager', 'Order_Manager', 'Contruction_Manager');
ALTER TABLE "Employee" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Employee" ALTER COLUMN "role" TYPE "EmpRole_new" USING ("role"::text::"EmpRole_new");
ALTER TYPE "EmpRole" RENAME TO "EmpRole_old";
ALTER TYPE "EmpRole_new" RENAME TO "EmpRole";
DROP TYPE "EmpRole_old";
ALTER TABLE "Employee" ALTER COLUMN "role" SET DEFAULT 'Technical_Manager';
COMMIT;

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "endDate" SET DATA TYPE TEXT,
ALTER COLUMN "startDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "state" "OrderState" DEFAULT 'IN_DEPARTURE';

-- DropEnum
DROP TYPE "OrderStatus";
