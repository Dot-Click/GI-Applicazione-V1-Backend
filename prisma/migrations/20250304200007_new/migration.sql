/*
  Warnings:

  - The values [ON_HOLD,IN_PROGRESS,COMPLETATO,CANCELLED] on the enum `OrderState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderState_new" AS ENUM ('On Hold', 'In Progress', 'Completato', 'Cancelled');
ALTER TABLE "Order" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "state" TYPE "OrderState_new" USING ("state"::text::"OrderState_new");
ALTER TYPE "OrderState" RENAME TO "OrderState_old";
ALTER TYPE "OrderState_new" RENAME TO "OrderState";
DROP TYPE "OrderState_old";
ALTER TABLE "Order" ALTER COLUMN "state" SET DEFAULT 'On Hold';
COMMIT;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "state" SET DEFAULT 'On Hold';
