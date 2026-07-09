-- Unifica usuários free legados: FK explícita para linha FREE → estado implícito (planId null).
-- Após este fix, o único estado free canônico é User.planId IS NULL.
--
-- Analytics/admin: contar usuários no plano gratuito com:
--   SELECT COUNT(*) FROM "User" WHERE "planId" IS NULL;
-- NÃO usar JOIN Plan WHERE slug = 'FREE' (legado, inválido pós-migration).

UPDATE "User"
SET "planId" = NULL
WHERE "planId" IN (SELECT "id" FROM "Plan" WHERE "slug" = 'FREE');
