-- CreateEnum
CREATE TYPE "ForumQuestionStatus" AS ENUM ('WAITING_ANSWER', 'ANSWERED');

-- CreateTable
CREATE TABLE "ForumQuestion" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "courseId" TEXT,
    "lessonId" INTEGER,
    "body" TEXT NOT NULL,
    "status" "ForumQuestionStatus" NOT NULL DEFAULT 'WAITING_ANSWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForumQuestion_authorId_idx" ON "ForumQuestion"("authorId");

-- CreateIndex
CREATE INDEX "ForumQuestion_courseId_idx" ON "ForumQuestion"("courseId");

-- CreateIndex
CREATE INDEX "ForumQuestion_lessonId_idx" ON "ForumQuestion"("lessonId");

-- CreateIndex
CREATE INDEX "ForumQuestion_status_idx" ON "ForumQuestion"("status");

-- CreateIndex
CREATE INDEX "ForumQuestion_createdAt_idx" ON "ForumQuestion"("createdAt");

-- CreateIndex
CREATE INDEX "ForumAnswer_questionId_idx" ON "ForumAnswer"("questionId");

-- CreateIndex
CREATE INDEX "ForumAnswer_authorId_idx" ON "ForumAnswer"("authorId");

-- CreateIndex
CREATE INDEX "ForumAnswer_createdAt_idx" ON "ForumAnswer"("createdAt");

-- AddForeignKey
ALTER TABLE "ForumQuestion" ADD CONSTRAINT "ForumQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumQuestion" ADD CONSTRAINT "ForumQuestion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumQuestion" ADD CONSTRAINT "ForumQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumAnswer" ADD CONSTRAINT "ForumAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ForumQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumAnswer" ADD CONSTRAINT "ForumAnswer_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
