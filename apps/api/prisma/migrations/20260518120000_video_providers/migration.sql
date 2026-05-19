-- CreateEnum
CREATE TYPE "VideoProviderStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'DISABLED');

-- CreateEnum
CREATE TYPE "VideoProviderAuditAction" AS ENUM ('CREATE', 'UPDATE', 'SET_DEFAULT', 'DEPRECATE', 'DISABLE');

-- CreateTable
CREATE TABLE "VideoProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "VideoProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isBuiltin" BOOLEAN NOT NULL DEFAULT false,
    "handlerKey" TEXT NOT NULL,
    "urlPlaceholder" TEXT NOT NULL DEFAULT '',
    "helpText" TEXT,
    "allowedDomains" JSONB NOT NULL DEFAULT '[]',
    "allowedProtocols" JSONB NOT NULL DEFAULT '["https"]',
    "maxUrlLength" INTEGER NOT NULL DEFAULT 2048,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoProviderAuditLog" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "VideoProviderAuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoProviderAuditLog_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Video" ADD COLUMN "providerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VideoProvider_slug_key" ON "VideoProvider"("slug");

-- CreateIndex
CREATE INDEX "VideoProvider_status_sortOrder_idx" ON "VideoProvider"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "VideoProviderAuditLog_providerId_createdAt_idx" ON "VideoProviderAuditLog"("providerId", "createdAt");

-- CreateIndex
CREATE INDEX "Video_providerId_idx" ON "Video"("providerId");

-- AddForeignKey
ALTER TABLE "VideoProvider" ADD CONSTRAINT "VideoProvider_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProviderAuditLog" ADD CONSTRAINT "VideoProviderAuditLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "VideoProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProviderAuditLog" ADD CONSTRAINT "VideoProviderAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "VideoProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
