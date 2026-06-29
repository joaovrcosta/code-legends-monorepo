-- CreateEnum
CREATE TYPE "CourseKind" AS ENUM ('CATALOG', 'PATH_UNIT');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "kind" "CourseKind" NOT NULL DEFAULT 'CATALOG';
ALTER TABLE "Course" ADD COLUMN "exclusiveCareerId" TEXT;

-- CreateIndex
CREATE INDEX "Course_kind_idx" ON "Course"("kind");
CREATE INDEX "Course_exclusiveCareerId_idx" ON "Course"("exclusiveCareerId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_exclusiveCareerId_fkey" FOREIGN KEY ("exclusiveCareerId") REFERENCES "Career"("id") ON DELETE SET NULL ON UPDATE CASCADE;
