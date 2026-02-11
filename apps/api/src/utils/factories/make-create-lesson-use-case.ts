import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { PrismaGroupRepository } from "../../repositories/prisma/prisma-group-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { CreateLessonUseCase } from "../../use-cases/entities/Lesson/create";

export function makeCreateLessonUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const groupRepository = new PrismaGroupRepository();
  const usersRepository = new PrismaUsersRepository();
  const createLessonUseCase = new CreateLessonUseCase(
    lessonRepository,
    groupRepository,
    usersRepository
  );

  return createLessonUseCase;
}
