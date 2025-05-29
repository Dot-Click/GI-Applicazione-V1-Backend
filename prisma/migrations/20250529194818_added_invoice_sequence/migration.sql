-- CreateTable
CREATE TABLE "InvoiceSequence" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "active_added_col_array" TEXT[],
    "active_visible_col_array" TEXT[],
    "passive_added_col_array" TEXT[],
    "passive_visible_col_array" TEXT[],

    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSequence_adminId_key" ON "InvoiceSequence"("adminId");

-- AddForeignKey
ALTER TABLE "InvoiceSequence" ADD CONSTRAINT "InvoiceSequence_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
