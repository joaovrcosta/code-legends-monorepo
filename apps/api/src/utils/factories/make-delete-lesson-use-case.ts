import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { DeleteLessonUseCase } from "../../use-cases/entities/Lesson/delete";

export function makeDeleteLessonUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const deleteLessonUseCase = new DeleteLessonUseCase(lessonRepository);

  return deleteLessonUseCase;
}
