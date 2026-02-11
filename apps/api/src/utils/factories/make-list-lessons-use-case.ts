import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { ListLessonsUseCase } from "../../use-cases/entities/Lesson/list";

export function makeListLessonsUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const listLessonsUseCase = new ListLessonsUseCase(lessonRepository);

  return listLessonsUseCase;
}
