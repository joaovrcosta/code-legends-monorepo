-- CreateTable
CREATE TABLE "LessonSkill" (
    "id" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "skillId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "LessonSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonSkill_lessonId_idx" ON "LessonSkill"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonSkill_lessonId_skillId_key" ON "LessonSkill"("lessonId", "skillId");

-- AddForeignKey
ALTER TABLE "LessonSkill" ADD CONSTRAINT "LessonSkill_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSkill" ADD CONSTRAINT "LessonSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
