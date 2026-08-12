import { ForumQuestionStatus, Role } from "@prisma/client";
import { ForumQuestionInvalidError } from "../../errors/forum-question-invalid";
import { ForumQuestionNotFoundError } from "../../errors/forum-question-not-found";
import { UnauthorizedError } from "../../errors/unauthorized";
import {
  ForumAnswerWithAuthor,
  IForumQuestionRepository,
} from "../../../repositories/forum-question-repository";

interface CreateForumAnswerRequest {
  questionId: string;
  authorId: string;
  authorRole: Role | string;
  body: string;
}

interface CreateForumAnswerResponse {
  answer: ForumAnswerWithAuthor;
}

export class CreateForumAnswerUseCase {
  constructor(private forumQuestionRepository: IForumQuestionRepository) {}

  async execute(
    data: CreateForumAnswerRequest,
  ): Promise<CreateForumAnswerResponse> {
    const isStaff =
      data.authorRole === Role.INSTRUCTOR || data.authorRole === Role.ADMIN;

    if (!isStaff) {
      throw new UnauthorizedError();
    }

    const body = data.body.trim();
    if (!body) {
      throw new ForumQuestionInvalidError("Escreva uma resposta.");
    }

    const question = await this.forumQuestionRepository.findById(
      data.questionId,
    );

    if (!question) {
      throw new ForumQuestionNotFoundError();
    }

    const answer = await this.forumQuestionRepository.createAnswer({
      questionId: data.questionId,
      authorId: data.authorId,
      body,
    });

    if (question.status === ForumQuestionStatus.WAITING_ANSWER) {
      await this.forumQuestionRepository.markAsAnswered(data.questionId);
    }

    return { answer };
  }
}
