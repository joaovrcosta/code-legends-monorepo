-- CreateTable
CREATE TABLE "LabCodeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "stepId" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabCodeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabCodeAttempt_userId_lessonId_createdAt_idx" ON "LabCodeAttempt"("userId", "lessonId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LabCodeAttempt_userId_lessonId_stepId_createdAt_idx" ON "LabCodeAttempt"("userId", "lessonId", "stepId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "LabCodeAttempt" ADD CONSTRAINT "LabCodeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabCodeAttempt" ADD CONSTRAINT "LabCodeAttempt_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
