/*
  Warnings:

  - The values [IN_DEPARTURE,COMPLETED] on the enum `OrderState` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attachment` on the `Order` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderState_new" AS ENUM ('TO_START', 'IN_PROGRESS', 'COMPLETATO', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "state" TYPE "OrderState_new" USING ("state"::text::"OrderState_new");
ALTER TYPE "OrderState" RENAME TO "OrderState_old";
ALTER TYPE "OrderState_new" RENAME TO "OrderState";
DROP TYPE "OrderState_old";
ALTER TABLE "Order" ALTER COLUMN "state" SET DEFAULT 'TO_START';
COMMIT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "attachment",
ADD COLUMN     "contratto" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/djv0vl33b/raw/upload/v1740534072/1740534069843_-_orders_ratliz.csv',
ADD COLUMN     "permesso_a_costruire" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/djv0vl33b/raw/upload/v1740534072/1740534069843_-_orders_ratliz.csv',
ADD COLUMN     "pos" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/djv0vl33b/raw/upload/v1740534072/1740534069843_-_orders_ratliz.csv',
ADD COLUMN     "psc" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/djv0vl33b/raw/upload/v1740534072/1740534069843_-_orders_ratliz.csv',
ALTER COLUMN "state" SET DEFAULT 'TO_START';
