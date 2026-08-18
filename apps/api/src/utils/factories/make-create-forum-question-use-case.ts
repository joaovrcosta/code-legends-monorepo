import { PrismaForumQuestionRepository } from "../../repositories/prisma/prisma-forum-question-repository";
import { CreateForumQuestionUseCase } from "../../use-cases/entities/Forum/create-question";

export function makeCreateForumQuestionUseCase() {
  const repository = new PrismaForumQuestionRepository();
  return new CreateForumQuestionUseCase(repository);
}
