-- AlterEnum
ALTER TYPE "LessonType" ADD VALUE 'lab';

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "learnTitle" TEXT,
    "durationMinutes" INTEGER,
    "learnBody" TEXT,
    "specs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_lessonId_key" ON "Lab"("lessonId");

-- AddForeignKey
ALTER TABLE "Lab" ADD CONSTRAINT "Lab_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
