-- Restored migration.
-- This migration exists in the database migration history but was missing locally.
-- Keeping it here avoids Prisma drift prompting a schema reset.
--
-- The database already contains these indexes; IF NOT EXISTS makes it safe.

-- UserCourse indexes (course metrics)
CREATE INDEX IF NOT EXISTS "UserCourse_courseId_completedAt_idx"
  ON "UserCourse"("courseId", "completedAt");
CREATE INDEX IF NOT EXISTS "UserCourse_courseId_enrolledAt_idx"
  ON "UserCourse"("courseId", "enrolledAt");
CREATE INDEX IF NOT EXISTS "UserCourse_courseId_lastAccessedAt_idx"
  ON "UserCourse"("courseId", "lastAccessedAt");

-- UserModuleProgress indexes
CREATE INDEX IF NOT EXISTS "UserModuleProgress_moduleId_completedAt_idx"
  ON "UserModuleProgress"("moduleId", "completedAt");
CREATE INDEX IF NOT EXISTS "UserModuleProgress_userCourseId_completedAt_idx"
  ON "UserModuleProgress"("userCourseId", "completedAt");

-- UserProgress indexes
CREATE INDEX IF NOT EXISTS "UserProgress_taskId_completedAt_idx"
  ON "UserProgress"("taskId", "completedAt");
CREATE INDEX IF NOT EXISTS "UserProgress_taskId_updatedAt_idx"
  ON "UserProgress"("taskId", "updatedAt");
CREATE INDEX IF NOT EXISTS "UserProgress_userCourseId_completedAt_idx"
  ON "UserProgress"("userCourseId", "completedAt");

