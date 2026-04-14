-- AlterTable
ALTER TABLE "User" ADD COLUMN     "postPurchaseWelcomeAckPaymentId" TEXT;

-- Backfill: evita abrir o modal para todos os usuários que já tinham pagamentos PAID antes do deploy.
UPDATE "User" u
SET "postPurchaseWelcomeAckPaymentId" = sub."id"
FROM (
  SELECT DISTINCT ON (p."userId") p."userId", p."id"
  FROM "Payment" p
  WHERE p."status" = 'PAID'
  ORDER BY p."userId", COALESCE(p."paidAt", p."createdAt") DESC
) sub
WHERE u."id" = sub."userId";
