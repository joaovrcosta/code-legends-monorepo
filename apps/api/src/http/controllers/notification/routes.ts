import { FastifyInstance } from "fastify";
import { list } from "./list.controller";
import { markAsRead } from "./mark-as-read.controller";
import { markAllAsRead } from "./mark-all-as-read.controller";
import { remove } from "./delete.controller";
import { getUnreadCount } from "./get-unread-count.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";

export async function notificationRoutes(app: FastifyInstance) {
  // Todas as rotas de notificações requerem autenticação
  app.get("/notifications", { onRequest: [verifyJWT] }, list);
  app.get("/notifications/unread-count", { onRequest: [verifyJWT] }, getUnreadCount);
  app.patch("/notifications/:id/read", { onRequest: [verifyJWT] }, markAsRead);
  app.patch("/notifications/read-all", { onRequest: [verifyJWT] }, markAllAsRead);
  app.delete("/notifications/:id", { onRequest: [verifyJWT] }, remove);
}
