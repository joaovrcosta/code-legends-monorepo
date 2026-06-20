-- CreateTable
CREATE TABLE "CourseDislike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseDislike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonDislike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonDislike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseDislike_courseId_idx" ON "CourseDislike"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseDislike_userId_courseId_key" ON "CourseDislike"("userId", "courseId");

-- CreateIndex
CREATE INDEX "LessonDislike_lessonId_idx" ON "LessonDislike"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonDislike_userId_lessonId_key" ON "LessonDislike"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "CourseDislike" ADD CONSTRAINT "CourseDislike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDislike" ADD CONSTRAINT "CourseDislike_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonDislike" ADD CONSTRAINT "LessonDislike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonDislike" ADD CONSTRAINT "LessonDislike_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
