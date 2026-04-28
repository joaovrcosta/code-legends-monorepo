-- CreateEnum
CREATE TYPE "LessonProductionStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED');

-- CreateTable
CREATE TABLE "LessonProduction" (
    "id" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "status" "LessonProductionStatus" NOT NULL DEFAULT 'TODO',
    "notes" TEXT,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProduction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonProduction_lessonId_key" ON "LessonProduction"("lessonId");

-- CreateIndex
CREATE INDEX "LessonProduction_status_idx" ON "LessonProduction"("status");

-- CreateIndex
CREATE INDEX "LessonProduction_updatedAt_idx" ON "LessonProduction"("updatedAt");

-- AddForeignKey
ALTER TABLE "LessonProduction" ADD CONSTRAINT "LessonProduction_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProduction" ADD CONSTRAINT "LessonProduction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
