-- CreateEnum
CREATE TYPE "SectionState" AS ENUM ('Valido', 'Scaduto');

-- AlterTable
ALTER TABLE "Formazone" ADD COLUMN     "state" "SectionState" DEFAULT 'Valido';

-- AlterTable
ALTER TABLE "Seritia" ADD COLUMN     "state" "SectionState" DEFAULT 'Valido';

-- AlterTable
ALTER TABLE "Unilav" ADD COLUMN     "state" "SectionState" DEFAULT 'Valido';
