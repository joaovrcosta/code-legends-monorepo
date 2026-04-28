-- CreateTable
CREATE TABLE "LessonProductionLog" (
    "id" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "fromStatus" "LessonProductionStatus" NOT NULL,
    "toStatus" "LessonProductionStatus" NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProductionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonProductionLog_courseId_createdAt_idx" ON "LessonProductionLog"("courseId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LessonProductionLog_lessonId_createdAt_idx" ON "LessonProductionLog"("lessonId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LessonProductionLog_actorId_createdAt_idx" ON "LessonProductionLog"("actorId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "LessonProductionLog" ADD CONSTRAINT "LessonProductionLog_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProductionLog" ADD CONSTRAINT "LessonProductionLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
