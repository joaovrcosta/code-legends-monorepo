import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { GetLessonBySlugUseCase } from "../../use-cases/entities/Lesson/get-by-slug";

export function makeGetLessonBySlugUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const getLessonBySlugUseCase = new GetLessonBySlugUseCase(lessonRepository);

  return getLessonBySlugUseCase;
}
