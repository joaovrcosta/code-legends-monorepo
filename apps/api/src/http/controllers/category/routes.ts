import { FastifyInstance } from "fastify";
import { list } from "./list.controller";
import { create } from "./create.controller";
import { update } from "./update.controller";
import { remove } from "./delete.controller";
import { getBySlug } from "./get-by-slug.controller";
import { verifyAdmin } from "../../middlewares/verify-admin";

export async function categoryRoutes(app: FastifyInstance) {
  // Rotas públicas
  app.get("/categories", list);
  app.get("/categories/:slug", getBySlug);

  // Rotas protegidas - apenas ADMIN
  app.post("/categories", { onRequest: [verifyAdmin] }, create);
  app.put("/categories/:id", { onRequest: [verifyAdmin] }, update);
  app.delete("/categories/:id", { onRequest: [verifyAdmin] }, remove);
}
