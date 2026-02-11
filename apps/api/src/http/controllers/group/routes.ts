import { FastifyInstance } from "fastify";
import { create } from "./create.controller";
import { list } from "./list.controller";
import { getById } from "./get-by-id.controller";
import { update } from "./update.controller";
import { remove } from "./delete.controller";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { verifyInstructorOrAdmin } from "../../middlewares/verify-instructor-or-admin";

export async function groupRoutes(app: FastifyInstance) {
  // Rotas aninhadas em modules
  app.get("/modules/:moduleId/groups", list);
  app.post(
    "/modules/:moduleId/groups",
    { onRequest: [verifyInstructorOrAdmin] },
    create
  );

  // Rotas públicas de grupos
  app.get("/groups/:id", getById);

  // Rotas protegidas - apenas ADMIN
  app.put("/groups/:id", { onRequest: [verifyAdmin] }, update);
  app.delete("/groups/:id", { onRequest: [verifyAdmin] }, remove);
}
