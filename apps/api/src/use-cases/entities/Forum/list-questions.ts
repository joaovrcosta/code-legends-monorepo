import { ForumQuestionStatus } from "@prisma/client";
import {
  ForumQuestionWithRelations,
  IForumQuestionRepository,
} from "../../../repositories/forum-question-repository";

interface ListForumQuestionsRequest {
  status?: ForumQuestionStatus;
  courseId?: string | null;
  authorId?: string;
  q?: string;
}

interface ListForumQuestionsResponse {
  questions: ForumQuestionWithRelations[];
}

export class ListForumQuestionsUseCase {
  constructor(private forumQuestionRepository: IForumQuestionRepository) {}

  async execute(
    filters: ListForumQuestionsRequest = {},
  ): Promise<ListForumQuestionsResponse> {
    const questions = await this.forumQuestionRepository.findMany(filters);
    return { questions };
  }
}
