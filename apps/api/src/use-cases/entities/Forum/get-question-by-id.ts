import { Role } from "@prisma/client";
import { ForumQuestionNotFoundError } from "../../errors/forum-question-not-found";
import {
  ForumQuestionDetail,
  IForumQuestionRepository,
} from "../../../repositories/forum-question-repository";

interface GetForumQuestionByIdRequest {
  id: string;
  requesterId: string;
  requesterRole: Role | string;
}

interface GetForumQuestionByIdResponse {
  question: ForumQuestionDetail;
}

export class GetForumQuestionByIdUseCase {
  constructor(private forumQuestionRepository: IForumQuestionRepository) {}

  async execute(
    data: GetForumQuestionByIdRequest,
  ): Promise<GetForumQuestionByIdResponse> {
    const question = await this.forumQuestionRepository.findById(data.id);

    if (!question) {
      throw new ForumQuestionNotFoundError();
    }

    const isStaff =
      data.requesterRole === Role.INSTRUCTOR ||
      data.requesterRole === Role.ADMIN;

    if (!isStaff && question.authorId !== data.requesterId) {
      throw new ForumQuestionNotFoundError();
    }

    return { question };
  }
}
