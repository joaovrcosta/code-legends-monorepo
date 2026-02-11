import { FastifyInstance } from "fastify";
import { create } from "./create.controller";
import { list } from "./list.controller";
import { listRecent } from "./list-recent.controller";
import { listPopular } from "./list-popular.controller";
import { getBySlug } from "./get-by-slug.controller";
import { search } from "./search.controller";
import { update } from "./update.controller";
import { remove } from "./delete.controller";
import { enroll } from "./enroll.controller";
import { getRoadmap } from "./get-roadmap.controller";
import { continueCourse } from "./continue.controller";
import { listEnrolled } from "./list-enrolled.controller";
import { listCompleted } from "./list-completed.controller";
import { start } from "./start.controller";
import { getActive } from "./get-active.controller";
import { myLearning } from "./my-learning.controller";
import { resetProgress } from "./reset-progress.controller";
import { getCourseProgress } from "./get-progress.controller";
import { getLessonBySlug } from "./get-lesson-by-slug.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { verifyJWTOptional } from "../../middlewares/verify-jwt-optional";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { verifyInstructorOrAdmin } from "../../middlewares/verify-instructor-or-admin";
import { verifyLessonAccess } from "../../middlewares/verify-lesson-access";

export async function courseRoutes(app: FastifyInstance) {
  app.get("/courses", { onRequest: [verifyJWTOptional] }, list); // Suporta ?category=id&categorySlug=slug&instructor=id&search=termo - isEnrolled incluído se autenticado
  app.get("/courses/search", { onRequest: [verifyJWTOptional] }, search); // Busca cursos por nome - Suporta ?q=termo - isEnrolled incluído se autenticado
  app.get("/courses/recent", listRecent); // Suporta ?limit=10
  app.get("/courses/popular", listPopular); // Suporta ?limit=10
  app.get("/courses/:slug", getBySlug);

  app.post("/courses", { onRequest: [verifyInstructorOrAdmin] }, create);

  app.put("/courses/:id", { onRequest: [verifyAdmin] }, update);
  app.delete("/courses/:id", { onRequest: [verifyAdmin] }, remove);

  app.get(
    "/courses/:courseId/lessons/:lessonSlug",
    {
      onRequest: [verifyJWT, verifyLessonAccess({ lessonSlugParam: "lessonSlug" })],
    },
    getLessonBySlug
  );
  app.get("/courses/:id/roadmap", { onRequest: [verifyJWT] }, getRoadmap);
  app.get("/courses/:courseIdentifier/progress", { onRequest: [verifyJWT] }, getCourseProgress);
  app.post("/courses/:id/enroll", { onRequest: [verifyJWT] }, enroll);
  app.post("/courses/:id/start", { onRequest: [verifyJWT] }, start);
  app.post("/courses/:id/reset-progress", { onRequest: [verifyJWT] }, resetProgress);
  app.get("/courses/:id/continue", { onRequest: [verifyJWT] }, continueCourse);
  app.get("/courses/continue", { onRequest: [verifyJWT] }, continueCourse); // Sem ID: usa curso ativo
  app.get("/courses/enrolled", { onRequest: [verifyJWT] }, listEnrolled);
  app.get("/courses/completed", { onRequest: [verifyJWT] }, listCompleted);
  app.get("/account/active-course", { onRequest: [verifyJWT] }, getActive);
  app.get("/my-learning", { onRequest: [verifyJWT] }, myLearning);
}
