import { PrismaForumQuestionRepository } from "../../repositories/prisma/prisma-forum-question-repository";
import { CreateForumAnswerUseCase } from "../../use-cases/entities/Forum/create-answer";

export function makeCreateForumAnswerUseCase() {
  const repository = new PrismaForumQuestionRepository();
  return new CreateForumAnswerUseCase(repository);
}
