-- AlterTable
ALTER TABLE "Script" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'script';

-- CreateIndex
CREATE INDEX "Script_kind_idx" ON "Script"("kind");
