-- AlterTable
ALTER TABLE "Career" ADD COLUMN "longDescription" TEXT;

-- Copia descrições existentes para a descrição longa
UPDATE "Career" SET "longDescription" = "description" WHERE "description" IS NOT NULL;
