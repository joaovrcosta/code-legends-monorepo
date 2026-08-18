import { ForumQuestionInvalidError } from "../../errors/forum-question-invalid";
import {
  ForumQuestionWithRelations,
  IForumQuestionRepository,
} from "../../../repositories/forum-question-repository";

interface CreateForumQuestionRequest {
  authorId: string;
  body: string;
  courseId?: string | null;
  lessonId?: number | null;
}

interface CreateForumQuestionResponse {
  question: ForumQuestionWithRelations;
}

export class CreateForumQuestionUseCase {
  constructor(private forumQuestionRepository: IForumQuestionRepository) {}

  async execute(
    data: CreateForumQuestionRequest,
  ): Promise<CreateForumQuestionResponse> {
    const body = data.body.trim();
    if (!body) {
      throw new ForumQuestionInvalidError("Descreva sua dúvida.");
    }

    const courseId = data.courseId ?? null;
    const lessonId = data.lessonId ?? null;

    if (!courseId && lessonId != null) {
      throw new ForumQuestionInvalidError(
        "Não é possível vincular uma aula a uma pergunta geral.",
      );
    }

    if (courseId) {
      const exists = await this.forumQuestionRepository.courseExists(courseId);
      if (!exists) {
        throw new ForumQuestionInvalidError("Curso não encontrado.");
      }
    }

    if (courseId && lessonId != null) {
      const belongs =
        await this.forumQuestionRepository.lessonBelongsToCourse(
          lessonId,
          courseId,
        );
      if (!belongs) {
        throw new ForumQuestionInvalidError(
          "A aula informada não pertence ao curso selecionado.",
        );
      }
    }

    const question = await this.forumQuestionRepository.create({
      authorId: data.authorId,
      courseId,
      lessonId,
      body,
    });

    return { question };
  }
}
