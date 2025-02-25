-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "archieved" BOOLEAN DEFAULT false,
ALTER COLUMN "isPublic" DROP NOT NULL;
