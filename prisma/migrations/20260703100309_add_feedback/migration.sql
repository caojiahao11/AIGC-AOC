-- CreateTable
CREATE TABLE "IssueFeedback" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "issueIndex" INTEGER,
    "vote" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IssueFeedback_reportId_idx" ON "IssueFeedback"("reportId");

-- CreateIndex
CREATE INDEX "IssueFeedback_vote_idx" ON "IssueFeedback"("vote");

-- AddForeignKey
ALTER TABLE "IssueFeedback" ADD CONSTRAINT "IssueFeedback_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AnalysisReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
