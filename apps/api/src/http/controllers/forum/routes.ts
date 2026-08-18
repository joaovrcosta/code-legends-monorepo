import { FastifyInstance } from "fastify";
import { Role } from "@prisma/client";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { verifyRBAC } from "../../middlewares/verify-rbac";
import { createQuestion } from "./create-question.controller";
import { listQuestions } from "./list-questions.controller";
import { getQuestionById } from "./get-question-by-id.controller";
import { createAnswer } from "./create-answer.controller";

export async function forumRoutes(app: FastifyInstance) {
  app.get("/forum/questions", { onRequest: [verifyJWT] }, listQuestions);
  app.post("/forum/questions", { onRequest: [verifyJWT] }, createQuestion);
  app.get("/forum/questions/:id", { onRequest: [verifyJWT] }, getQuestionById);
  app.post(
    "/forum/questions/:id/answers",
    { onRequest: [verifyRBAC([Role.INSTRUCTOR, Role.ADMIN])] },
    createAnswer,
  );
}
