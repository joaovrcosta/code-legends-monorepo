import { PrismaForumQuestionRepository } from "../../repositories/prisma/prisma-forum-question-repository";
import { ListForumQuestionsUseCase } from "../../use-cases/entities/Forum/list-questions";

export function makeListForumQuestionsUseCase() {
  const repository = new PrismaForumQuestionRepository();
  return new ListForumQuestionsUseCase(repository);
}
