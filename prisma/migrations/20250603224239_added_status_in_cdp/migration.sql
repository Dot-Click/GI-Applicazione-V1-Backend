-- AlterTable
ALTER TABLE "Accounts" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "CDP" ADD COLUMN     "status" "accState" DEFAULT 'Da_approvare';
