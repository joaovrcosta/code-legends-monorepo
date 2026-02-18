import { FastifyInstance } from "fastify";
import { list } from "./list.controller";
import { markAsRead } from "./mark-as-read.controller";
import { markAllAsRead } from "./mark-all-as-read.controller";
import { remove } from "./delete.controller";
import { getUnreadCount } from "./get-unread-count.controller";
import { notificationSSE } from "./sse.controller";
import { create } from "./create.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { env } from "../../../env/index";

export async function notificationRoutes(app: FastifyInstance) {
  app.options("/notifications/sse", async (request, reply) => {
    const origin = request.headers.origin;
    const devOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    const prodOrigins = [
      "https://www.codelegends.com.br",
      "https://codelegends.com.br",
    ];

    const allowedOrigins = env.NODE_ENV === "production"
      ? prodOrigins
      : [...devOrigins, ...prodOrigins];

    const corsOrigin = origin && allowedOrigins.includes(origin)
      ? origin
      : (env.NODE_ENV === "production" ? prodOrigins[0] : devOrigins[0]);

    reply.header("Access-Control-Allow-Origin", corsOrigin);
    reply.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");
    reply.header("Access-Control-Allow-Credentials", "true");
    reply.header("Access-Control-Max-Age", "86400");
    return reply.status(204).send();
  });

  app.get("/notifications", { onRequest: [verifyJWT] }, list);
  app.get("/notifications/unread-count", { onRequest: [verifyJWT] }, getUnreadCount);
  app.get("/notifications/sse", { onRequest: [verifyJWT] }, notificationSSE);
  app.post("/notifications", { onRequest: [verifyJWT] }, create);
  app.patch("/notifications/:id/read", { onRequest: [verifyJWT] }, markAsRead);
  app.patch("/notifications/read-all", { onRequest: [verifyJWT] }, markAllAsRead);
  app.delete("/notifications/:id", { onRequest: [verifyJWT] }, remove);
}
