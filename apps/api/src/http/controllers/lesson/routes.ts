import { FastifyInstance } from "fastify";
import { create } from "./create.controller";
import { list } from "./list.controller";
import { getBySlug } from "./get-by-slug.controller";
import { getById as getLessonById } from "./get-by-id.controller";
import { update } from "./update.controller";
import { remove } from "./delete.controller";
import { complete } from "./complete.controller";
import { awardChallengeXp } from "./award-challenge-xp.controller";
import {
  getLabProgress,
  upsertLabProgress,
} from "./lab-progress.controller";
import { getLessonLikes } from "./get-likes.controller";
import { addLessonLike } from "./add-like.controller";
import { removeLessonLike } from "./remove-like.controller";
import { addLessonDislike } from "./add-dislike.controller";
import { removeLessonDislike } from "./remove-dislike.controller";
import { getLessonSkillsConfig } from "./get-skills-config.controller";
import { updateLessonSkillsConfig } from "./update-skills-config.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { verifyInstructorOrAdmin } from "../../middlewares/verify-instructor-or-admin";
import { verifyLessonAccess } from "../../middlewares/verify-lesson-access";
import { verifyJWTOptional } from "../../middlewares/verify-jwt-optional";

export async function lessonRoutes(app: FastifyInstance) {
  // Rotas aninhadas em groups
  app.get("/groups/:groupId/lessons", list);
  app.post(
    "/groups/:groupId/lessons",
    { onRequest: [verifyInstructorOrAdmin] },
    create
  );

  app.get(
    "/lessons/id/:lessonId",
    { onRequest: [verifyInstructorOrAdmin] },
    getLessonById,
  );

  app.get(
    "/lessons/:id/likes",
    { onRequest: [verifyJWTOptional] },
    getLessonLikes,
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

  app.get(
    "/lessons/:id/lab-progress",
    {
      onRequest: [
        verifyJWT,
        verifyLessonAccess({ lessonIdParam: "id", allowInstructors: false }),
      ],
    },
    getLabProgress,
  );

  app.put(
    "/lessons/:id/lab-progress",
    {
      onRequest: [
        verifyJWT,
        verifyLessonAccess({ lessonIdParam: "id", allowInstructors: false }),
      ],
    },
    upsertLabProgress,
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

  app.post(
    "/lessons/:id/likes",
    {
      onRequest: [
        verifyJWT,
        verifyLessonAccess({ lessonIdParam: "id", allowInstructors: false }),
      ],
    },
    addLessonLike,
  );

  app.delete(
    "/lessons/:id/likes",
    {
      onRequest: [
        verifyJWT,
        verifyLessonAccess({ lessonIdParam: "id", allowInstructors: false }),
      ],
    },
    removeLessonLike,
  );

  app.post(
    "/lessons/:id/dislikes",
    {
      onRequest: [
        verifyJWT,
        verifyLessonAccess({ lessonIdParam: "id", allowInstructors: false }),
      ],
    },
    addLessonDislike,
  );

  app.delete(
    "/lessons/:id/dislikes",
    {
      onRequest: [
        verifyJWT,
        verifyLessonAccess({ lessonIdParam: "id", allowInstructors: false }),
      ],
    },
    removeLessonDislike,
  );
}
