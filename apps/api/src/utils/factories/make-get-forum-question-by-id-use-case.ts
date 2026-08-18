import { PrismaForumQuestionRepository } from "../../repositories/prisma/prisma-forum-question-repository";
import { GetForumQuestionByIdUseCase } from "../../use-cases/entities/Forum/get-question-by-id";

export function makeGetForumQuestionByIdUseCase() {
  const repository = new PrismaForumQuestionRepository();
  return new GetForumQuestionByIdUseCase(repository);
}
