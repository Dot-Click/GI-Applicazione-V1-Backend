/*
  Warnings:

  - The values [TO_START] on the enum `OrderState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderState_new" AS ENUM ('ON_HOLD', 'IN_PROGRESS', 'COMPLETATO', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "state" TYPE "OrderState_new" USING ("state"::text::"OrderState_new");
ALTER TYPE "OrderState" RENAME TO "OrderState_old";
ALTER TYPE "OrderState_new" RENAME TO "OrderState";
DROP TYPE "OrderState_old";
ALTER TABLE "Order" ALTER COLUMN "state" SET DEFAULT 'ON_HOLD';
COMMIT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "ateco" TEXT,
ADD COLUMN     "cap" TEXT,
ADD COLUMN     "common" TEXT,
ADD COLUMN     "nation" TEXT,
ADD COLUMN     "province" TEXT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "lat" SET DEFAULT 37.7749,
ALTER COLUMN "lng" SET DEFAULT -122.4194,
ALTER COLUMN "state" SET DEFAULT 'ON_HOLD';

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "cap" TEXT,
ADD COLUMN     "common" TEXT,
ADD COLUMN     "nation" TEXT,
ADD COLUMN     "province" TEXT;
