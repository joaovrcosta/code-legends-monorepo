import { FastifyInstance } from "fastify";
import { create } from "./create.controller";
import { list } from "./list.controller";
import { listWithProgress } from "./list-with-progress.controller";
import { updateCurrent } from "./update-current.controller";
import { unlockNextModule } from "./unlock-next-module.controller";
import { continueToNextModule } from "./continue-to-next-module.controller";
import { getBySlug } from "./get-by-slug.controller";
import { update } from "./update.controller";
import { remove } from "./delete.controller";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { verifyInstructorOrAdmin } from "../../middlewares/verify-instructor-or-admin";
import { verifyJWT } from "../../middlewares/verify-jwt";

export async function moduleRoutes(app: FastifyInstance) {
  // Rotas aninhadas em courses
  // IMPORTANTE: Rotas mais específicas devem vir ANTES das genéricas
  app.get(
    "/courses/:courseIdentifier/modules/with-progress",
    { onRequest: [verifyJWT] },
    listWithProgress
  );
  app.put(
    "/courses/:courseId/modules/:moduleId/current",
    { onRequest: [verifyJWT] },
    updateCurrent
  );
  app.post(
    "/courses/:courseId/modules/continue-next",
    { onRequest: [verifyJWT] },
    continueToNextModule
  );
  app.post(
    "/courses/:courseId/modules/unlock-next",
    { onRequest: [verifyJWT] },
    unlockNextModule
  );
  app.get("/courses/:courseId/modules", list);
  app.post(
    "/courses/:courseId/modules",
    { onRequest: [verifyInstructorOrAdmin] },
    create
  );

  // Rotas públicas de módulos
  app.get("/modules/:slug", getBySlug);

  // Rotas protegidas - apenas ADMIN
  app.put("/modules/:id", { onRequest: [verifyAdmin] }, update);
  app.delete("/modules/:id", { onRequest: [verifyAdmin] }, remove);
}
