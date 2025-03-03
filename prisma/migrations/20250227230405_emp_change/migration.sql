-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "role" SET DEFAULT 'Admin';

-- CreateTable
CREATE TABLE "Unilav" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" "Status" DEFAULT 'active',
    "attachment" TEXT NOT NULL,
    "healthEligibility" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "dataRilascio" TEXT NOT NULL,
    "validityDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unilav_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seritia" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" "Status" DEFAULT 'active',
    "attachment" TEXT NOT NULL,
    "healthEligibility" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "dataRilascio" TEXT NOT NULL,
    "validityDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seritia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formazone" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" "Status" DEFAULT 'active',
    "attachment" TEXT NOT NULL,
    "formazone" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "dataRilascio" TEXT NOT NULL,
    "validityDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formazone_pkey" PRIMARY KEY ("id")
);
