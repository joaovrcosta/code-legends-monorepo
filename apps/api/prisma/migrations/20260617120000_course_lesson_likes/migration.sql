-- CreateTable
CREATE TABLE "CourseLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseLike_courseId_idx" ON "CourseLike"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLike_userId_courseId_key" ON "CourseLike"("userId", "courseId");

-- CreateIndex
CREATE INDEX "LessonLike_lessonId_idx" ON "LessonLike"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonLike_userId_lessonId_key" ON "LessonLike"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "CourseLike" ADD CONSTRAINT "CourseLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLike" ADD CONSTRAINT "CourseLike_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLike" ADD CONSTRAINT "LessonLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLike" ADD CONSTRAINT "LessonLike_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
