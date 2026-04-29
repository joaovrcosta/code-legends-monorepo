-- CreateEnum
CREATE TYPE "LessonProductionPriority" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "LessonProduction" ADD COLUMN "priority" "LessonProductionPriority" NOT NULL DEFAULT 'NONE';
