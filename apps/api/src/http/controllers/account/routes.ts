import { FastifyInstance } from "fastify";
import { create } from "./create.controller";
import { authenticate } from "./authenticate.controller";
import { profile } from "./profile.controller";
import { refreshToken } from "./refresh-token.controller";
import { getOnboardingStatus } from "./get-onboarding-status.controller";
import { updateOnboarding } from "./update-onboarding.controller";
import { completeOnboarding } from "./complete-onboarding.controller";
import { listUsers } from "./list.controller";
import { getById } from "./get-by-id.controller";
import { listInstructors } from "./list-instructors.controller";
import { getAccountOverview, updateAccountData } from "./account-overview.controller";
import { remove } from "./delete.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { verifyInstructorOrAdmin } from "../../middlewares/verify-instructor-or-admin";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/users", create);
  app.post("/users/auth", authenticate);
  app.post("/token/refresh", refreshToken);

  // Rotas autenticadas
  app.get("/me", { onRequest: [verifyJWT] }, profile);
  app.get("/users/onboarding/status", { onRequest: [verifyJWT] }, getOnboardingStatus);
  app.post("/users/onboarding", { onRequest: [verifyJWT] }, updateOnboarding);
  app.post("/users/onboarding/complete", { onRequest: [verifyJWT] }, completeOnboarding);

  // Rotas protegidas - apenas ADMIN
  app.get("/users", { onRequest: [verifyAdmin] }, listUsers);
  app.get("/users/:id", { onRequest: [verifyAdmin] }, getById);
  app.delete("/users/:id", { onRequest: [verifyAdmin] }, remove);
  app.get("/users/:userId/overview", { onRequest: [verifyAdmin] }, getAccountOverview);
  app.put("/users/:userId/overview", { onRequest: [verifyAdmin] }, updateAccountData);

  // Rotas protegidas - ADMIN ou INSTRUCTOR
  app.get("/instructors", { onRequest: [verifyInstructorOrAdmin] }, listInstructors);
}
