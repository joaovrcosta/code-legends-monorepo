-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "colorHex" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerModule" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerModuleCourse" (
    "id" TEXT NOT NULL,
    "careerModuleId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CareerModuleCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerExam" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "maxAttempts" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerModuleExam" (
    "id" TEXT NOT NULL,
    "careerModuleId" TEXT NOT NULL,
    "careerExamId" TEXT NOT NULL,
    "examIndex" INTEGER NOT NULL,

    CONSTRAINT "CareerModuleExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCareer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "UserCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCareerExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userCareerId" TEXT NOT NULL,
    "careerExamId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCareerExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCareerModuleStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userCareerId" TEXT NOT NULL,
    "careerModuleId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCareerModuleStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Career_slug_key" ON "Career"("slug");

-- CreateIndex
CREATE INDEX "CareerModule_careerId_orderIndex_idx" ON "CareerModule"("careerId", "orderIndex");

-- CreateIndex
CREATE INDEX "CareerModuleCourse_courseId_idx" ON "CareerModuleCourse"("courseId");

-- CreateIndex
CREATE INDEX "CareerModuleCourse_careerModuleId_orderIndex_idx" ON "CareerModuleCourse"("careerModuleId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "CareerModuleCourse_careerModuleId_courseId_key" ON "CareerModuleCourse"("careerModuleId", "courseId");

-- CreateIndex
CREATE INDEX "CareerExam_careerId_idx" ON "CareerExam"("careerId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerExam_careerId_slug_key" ON "CareerExam"("careerId", "slug");

-- CreateIndex
CREATE INDEX "CareerModuleExam_careerExamId_idx" ON "CareerModuleExam"("careerExamId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerModuleExam_careerModuleId_examIndex_key" ON "CareerModuleExam"("careerModuleId", "examIndex");

-- CreateIndex
CREATE UNIQUE INDEX "CareerModuleExam_careerModuleId_careerExamId_key" ON "CareerModuleExam"("careerModuleId", "careerExamId");

-- CreateIndex
CREATE INDEX "UserCareer_careerId_idx" ON "UserCareer"("careerId");

-- CreateIndex
CREATE INDEX "UserCareer_userId_idx" ON "UserCareer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCareer_userId_careerId_key" ON "UserCareer"("userId", "careerId");

-- CreateIndex
CREATE INDEX "UserCareerExamAttempt_userCareerId_careerExamId_createdAt_idx" ON "UserCareerExamAttempt"("userCareerId", "careerExamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserCareerExamAttempt_userId_careerExamId_createdAt_idx" ON "UserCareerExamAttempt"("userId", "careerExamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserCareerModuleStatus_userId_idx" ON "UserCareerModuleStatus"("userId");

-- CreateIndex
CREATE INDEX "UserCareerModuleStatus_careerModuleId_idx" ON "UserCareerModuleStatus"("careerModuleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCareerModuleStatus_userCareerId_careerModuleId_key" ON "UserCareerModuleStatus"("userCareerId", "careerModuleId");

-- AddForeignKey
ALTER TABLE "CareerModule" ADD CONSTRAINT "CareerModule_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerModuleCourse" ADD CONSTRAINT "CareerModuleCourse_careerModuleId_fkey" FOREIGN KEY ("careerModuleId") REFERENCES "CareerModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerModuleCourse" ADD CONSTRAINT "CareerModuleCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerExam" ADD CONSTRAINT "CareerExam_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerModuleExam" ADD CONSTRAINT "CareerModuleExam_careerModuleId_fkey" FOREIGN KEY ("careerModuleId") REFERENCES "CareerModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerModuleExam" ADD CONSTRAINT "CareerModuleExam_careerExamId_fkey" FOREIGN KEY ("careerExamId") REFERENCES "CareerExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCareer" ADD CONSTRAINT "UserCareer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCareer" ADD CONSTRAINT "UserCareer_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCareerExamAttempt" ADD CONSTRAINT "UserCareerExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCareerExamAttempt" ADD CONSTRAINT "UserCareerExamAttempt_userCareerId_fkey" FOREIGN KEY ("userCareerId") REFERENCES "UserCareer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCareerExamAttempt" ADD CONSTRAINT "UserCareerExamAttempt_careerExamId_fkey" FOREIGN KEY ("careerExamId") REFERENCES "CareerExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCareerModuleStatus" ADD CONSTRAINT "UserCareerModuleStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCareerModuleStatus" ADD CONSTRAINT "UserCareerModuleStatus_userCareerId_fkey" FOREIGN KEY ("userCareerId") REFERENCES "UserCareer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCareerModuleStatus" ADD CONSTRAINT "UserCareerModuleStatus_careerModuleId_fkey" FOREIGN KEY ("careerModuleId") REFERENCES "CareerModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

