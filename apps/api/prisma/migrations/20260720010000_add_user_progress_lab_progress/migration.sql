-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN IF NOT EXISTS "labProgress" JSONB;
