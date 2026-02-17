import { FastifyInstance } from "fastify";
import { create } from "./create.controller";
import { list } from "./list.controller";
import { getById } from "./get-by-id.controller";
import { getByUserId } from "./get-by-user-id.controller";
import { getMyRequests } from "./get-my-requests.controller";
import { update } from "./update.controller";
import { remove } from "./delete.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { verifyAdmin } from "../../middlewares/verify-admin";

export async function requestRoutes(app: FastifyInstance) {
  // Rotas autenticadas - usuários podem criar e ver suas próprias solicitações
  app.post("/requests", { onRequest: [verifyJWT] }, create);
  app.get("/requests/my", { onRequest: [verifyJWT] }, getMyRequests);
  app.get("/requests/:id", { onRequest: [verifyJWT] }, getById);

  // Rotas protegidas - apenas ADMIN
  app.get("/requests", { onRequest: [verifyAdmin] }, list);
  app.get("/requests/user/:userId", { onRequest: [verifyAdmin] }, getByUserId);
  app.put("/requests/:id", { onRequest: [verifyAdmin] }, update);
  app.delete("/requests/:id", { onRequest: [verifyAdmin] }, remove);
}
