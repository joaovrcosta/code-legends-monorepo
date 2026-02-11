import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";

interface ListLessonsRequest {
  groupId?: number;
}

interface ListLessonsResponse {
  lessons: Lesson[];
}

export class ListLessonsUseCase {
  constructor(private lessonRepository: ILessonRepository) {}

  async execute(filters?: ListLessonsRequest): Promise<ListLessonsResponse> {
    const lessons = await this.lessonRepository.findAll(filters?.groupId);

    return {
      lessons,
    };
  }
}
