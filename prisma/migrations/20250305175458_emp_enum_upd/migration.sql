/*
  Warnings:

  - The values [Contruction_Manager] on the enum `EmpRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmpRole_new" AS ENUM ('Admin', 'Technical_Manager', 'Order_Manager', 'Construction_Manager');
ALTER TABLE "Employee" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Employee" ALTER COLUMN "role" TYPE "EmpRole_new" USING ("role"::text::"EmpRole_new");
ALTER TYPE "EmpRole" RENAME TO "EmpRole_old";
ALTER TYPE "EmpRole_new" RENAME TO "EmpRole";
DROP TYPE "EmpRole_old";
ALTER TABLE "Employee" ALTER COLUMN "role" SET DEFAULT 'Admin';
COMMIT;
