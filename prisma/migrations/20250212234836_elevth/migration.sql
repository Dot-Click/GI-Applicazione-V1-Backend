-- CreateEnum
CREATE TYPE "State" AS ENUM ('pending', 'ongoing', 'completed');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "projectManager" TEXT NOT NULL,
    "technicalManager" TEXT NOT NULL,
    "constructionManager" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "state" "State" NOT NULL DEFAULT 'pending',
    "clientId" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
