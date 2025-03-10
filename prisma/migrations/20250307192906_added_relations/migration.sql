-- CreateTable
CREATE TABLE "custSequence" (
    "id" TEXT NOT NULL,
    "added_col_array" TEXT[],
    "visible_col_array" TEXT[],
    "adminId" TEXT,

    CONSTRAINT "custSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supSequence" (
    "id" TEXT NOT NULL,
    "added_col_array" TEXT[],
    "visible_col_array" TEXT[],
    "adminId" TEXT,

    CONSTRAINT "supSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empSequence" (
    "id" TEXT NOT NULL,
    "added_col_array" TEXT[],
    "visible_col_array" TEXT[],
    "adminId" TEXT,

    CONSTRAINT "empSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custSequence_adminId_key" ON "custSequence"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "supSequence_adminId_key" ON "supSequence"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "empSequence_adminId_key" ON "empSequence"("adminId");

-- AddForeignKey
ALTER TABLE "custSequence" ADD CONSTRAINT "custSequence_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supSequence" ADD CONSTRAINT "supSequence_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empSequence" ADD CONSTRAINT "empSequence_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
