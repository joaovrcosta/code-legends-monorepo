-- Plan.features (Json array de capability keys; v1 sem índice GIN)
ALTER TABLE "Plan" ADD COLUMN "features" JSONB NOT NULL DEFAULT '[]';

-- FK planId em User, Payment, Subscription
ALTER TABLE "User" ADD COLUMN "planId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "planId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "planId" TEXT;

UPDATE "User" u
SET "planId" = p."id"
FROM "Plan" p
WHERE p."slug" = u."plan"::text;

UPDATE "Payment" pay
SET "planId" = p."id"
FROM "Plan" p
WHERE p."slug" = pay."plan"::text;

UPDATE "Subscription" s
SET "planId" = p."id"
FROM "Plan" p
WHERE p."slug" = s."plan"::text;

UPDATE "User"
SET "planId" = (SELECT "id" FROM "Plan" WHERE "slug" = 'FREE' LIMIT 1)
WHERE "planId" IS NULL;

UPDATE "Payment"
SET "planId" = (SELECT "id" FROM "Plan" WHERE "slug" = 'FREE' LIMIT 1)
WHERE "planId" IS NULL;

UPDATE "Subscription"
SET "planId" = (SELECT "id" FROM "Plan" WHERE "slug" = 'FREE' LIMIT 1)
WHERE "planId" IS NULL;

ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User" DROP COLUMN "plan";
ALTER TABLE "Payment" DROP COLUMN "plan";
ALTER TABLE "Subscription" DROP COLUMN "plan";

DROP TYPE "UserPlan";

ALTER TABLE "Payment" ALTER COLUMN "planId" SET NOT NULL;
ALTER TABLE "Subscription" ALTER COLUMN "planId" SET NOT NULL;

CREATE INDEX "User_planId_idx" ON "User"("planId");
CREATE INDEX "Payment_planId_idx" ON "Payment"("planId");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");
