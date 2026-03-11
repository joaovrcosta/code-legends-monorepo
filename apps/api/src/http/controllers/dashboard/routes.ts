import { FastifyInstance } from "fastify";
import { overview } from "./overview.controller";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { verifyInstructorOrAdmin } from "../../middlewares/verify-instructor-or-admin";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    "/dashboard/overview",
    { onRequest: [verifyInstructorOrAdmin] },
    overview
  );
}
