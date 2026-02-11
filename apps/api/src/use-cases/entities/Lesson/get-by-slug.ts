import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { LessonNotFoundError } from "../../errors/lesson-not-found";

interface GetLessonBySlugRequest {
  slug: string;
}

interface GetLessonBySlugResponse {
  lesson: Lesson;
}

export class GetLessonBySlugUseCase {
  constructor(private lessonRepository: ILessonRepository) {}

  async execute({
    slug,
  }: GetLessonBySlugRequest): Promise<GetLessonBySlugResponse> {
    const lesson = await this.lessonRepository.findBySlug(slug);

    if (!lesson) {
      throw new LessonNotFoundError();
    }

    return {
      lesson,
    };
  }
}
