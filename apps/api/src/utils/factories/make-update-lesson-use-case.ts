import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { UpdateLessonUseCase } from "../../use-cases/entities/Lesson/update";

export function makeUpdateLessonUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const updateLessonUseCase = new UpdateLessonUseCase(lessonRepository);

  return updateLessonUseCase;
}
