-- CreateEnum
CREATE TYPE "accState" AS ENUM ('Approvato', 'Da_approvare', 'Non_approvata');

-- DropForeignKey
ALTER TABLE "Formazone" DROP CONSTRAINT "Formazone_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Seritia" DROP CONSTRAINT "Seritia_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Unilav" DROP CONSTRAINT "Unilav_employeeId_fkey";

-- CreateTable
CREATE TABLE "Accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "suppCode" TEXT NOT NULL,
    "wbs" TEXT,
    "date" DATE,
    "adminId" TEXT,
    "see_SAL" TEXT,
    "current_SAL_amount" DECIMAL(10,4),
    "progressive_SAL_amount" DECIMAL(10,4),
    "status" "accState" DEFAULT 'Da_approvare',
    "ordCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SAL" (
    "id" TEXT NOT NULL,
    "accId" TEXT,
    "add_additional_1" TEXT,
    "desc_additional_1" TEXT,
    "add_additional_2" TEXT,
    "desc_additional_2" TEXT,
    "add_additional_3" TEXT,
    "desc_additional_3" TEXT,
    "total" DECIMAL(10,4),
    "discounts" DECIMAL(10,4),
    "roundingDiscount" DECIMAL(10,4),
    "agreed" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SAL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SALsect" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "salId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SALsect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salData" (
    "id" TEXT NOT NULL,
    "unitOfMeasures" TEXT,
    "eqlParts" INTEGER,
    "description" TEXT,
    "lun" INTEGER,
    "lar" INTEGER,
    "alt" INTEGER,
    "quantity" INTEGER,
    "salSectId" TEXT,
    "price" DECIMAL(10,4),
    "amount" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_code_key" ON "Accounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_suppCode_ordCode_key" ON "Accounts"("suppCode", "ordCode");

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_suppCode_fkey" FOREIGN KEY ("suppCode") REFERENCES "Supplier"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_ordCode_fkey" FOREIGN KEY ("ordCode") REFERENCES "Order"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SAL" ADD CONSTRAINT "SAL_accId_fkey" FOREIGN KEY ("accId") REFERENCES "Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SALsect" ADD CONSTRAINT "SALsect_salId_fkey" FOREIGN KEY ("salId") REFERENCES "SAL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salData" ADD CONSTRAINT "salData_salSectId_fkey" FOREIGN KEY ("salSectId") REFERENCES "SALsect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unilav" ADD CONSTRAINT "Unilav_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seritia" ADD CONSTRAINT "Seritia_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formazone" ADD CONSTRAINT "Formazone_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
