-- CreateEnum
CREATE TYPE "PaymentProviderStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'DISABLED');

-- CreateEnum
CREATE TYPE "PaymentProviderAuditAction" AS ENUM ('CREATE', 'UPDATE', 'SET_DEFAULT', 'SET_STATUS');

-- CreateEnum
CREATE TYPE "PaymentProviderMethod" AS ENUM ('CARD', 'PIX', 'BOLETO');

-- CreateTable
CREATE TABLE "PaymentProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "handlerKey" TEXT NOT NULL,
    "gatewayCode" TEXT NOT NULL,
    "status" "PaymentProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isBuiltin" BOOLEAN NOT NULL DEFAULT false,
    "supportedMethods" "PaymentProviderMethod"[] DEFAULT ARRAY['CARD']::"PaymentProviderMethod"[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "helpText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProviderAuditLog" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "PaymentProviderAuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentProviderAuditLog_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "providerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProvider_slug_key" ON "PaymentProvider"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProvider_gatewayCode_key" ON "PaymentProvider"("gatewayCode");

-- CreateIndex
CREATE INDEX "PaymentProvider_status_sortOrder_idx" ON "PaymentProvider"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "PaymentProviderAuditLog_providerId_createdAt_idx" ON "PaymentProviderAuditLog"("providerId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_providerId_idx" ON "Payment"("providerId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "PaymentProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProviderAuditLog" ADD CONSTRAINT "PaymentProviderAuditLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "PaymentProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
