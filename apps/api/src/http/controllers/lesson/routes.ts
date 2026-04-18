import { FastifyInstance } from "fastify";
import { create } from "./create.controller";
import { list } from "./list.controller";
import { getBySlug } from "./get-by-slug.controller";
import { update } from "./update.controller";
import { remove } from "./delete.controller";
import { complete } from "./complete.controller";
import { awardChallengeXp } from "./award-challenge-xp.controller";
import { getLessonSkillsConfig } from "./get-skills-config.controller";
import { updateLessonSkillsConfig } from "./update-skills-config.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { verifyInstructorOrAdmin } from "../../middlewares/verify-instructor-or-admin";
import { verifyLessonAccess } from "../../middlewares/verify-lesson-access";

export async function lessonRoutes(app: FastifyInstance) {
  // Rotas aninhadas em groups
  app.get("/groups/:groupId/lessons", list);
  app.post(
    "/groups/:groupId/lessons",
    { onRequest: [verifyInstructorOrAdmin] },
    create
  );

  // Rotas protegidas de lições - requer autenticação e verificação de acesso
  app.get(
    "/lessons/:slug",
    {
      onRequest: [verifyJWT, verifyLessonAccess({ lessonSlugParam: "slug" })],
    },
    getBySlug
  );

  // Rotas protegidas - apenas ADMIN
  app.put("/lessons/:id", { onRequest: [verifyAdmin] }, update);
  app.delete("/lessons/:id", { onRequest: [verifyAdmin] }, remove);
  app.get(
    "/lessons/:id/skills-config",
    { onRequest: [verifyAdmin] },
    getLessonSkillsConfig
  );
  app.put(
    "/lessons/:id/skills-config",
    { onRequest: [verifyAdmin] },
    updateLessonSkillsConfig
  );

  // Rotas protegidas - requer autenticação JWT e verificação de acesso
  app.post(
    "/lessons/:id/complete",
    {
      onRequest: [
        verifyJWT,
        verifyLessonAccess({ lessonIdParam: "id", allowInstructors: false }),
      ],
    },
    complete
  );

  app.post(
    "/lessons/:id/challenge-xp",
    {
      onRequest: [
        verifyJWT,
        verifyLessonAccess({ lessonIdParam: "id", allowInstructors: false }),
      ],
    },
    awardChallengeXp
  );
}
