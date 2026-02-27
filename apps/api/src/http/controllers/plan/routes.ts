import { FastifyInstance } from "fastify";
import { listPlans, listPublicPlans } from "./list.controller";
import { getPlanById } from "./get-by-id.controller";
import { createPlan } from "./create.controller";
import { updatePlan } from "./update.controller";
import { verifyAdmin } from "../../middlewares/verify-admin";

export async function planRoutes(app: FastifyInstance) {
  // Rota pública para o frontend listar planos ativos
  app.get("/public/plans", listPublicPlans);

  // Rotas protegidas - apenas ADMIN
  app.get("/plans", { onRequest: [verifyAdmin] }, listPlans);
  app.get("/plans/:id", { onRequest: [verifyAdmin] }, getPlanById);
  app.post("/plans", { onRequest: [verifyAdmin] }, createPlan);
  app.patch("/plans/:id", { onRequest: [verifyAdmin] }, updatePlan);
}
