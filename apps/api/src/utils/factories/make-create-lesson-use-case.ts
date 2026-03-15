import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { PrismaGroupRepository } from "../../repositories/prisma/prisma-group-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaVideoRepository } from "../../repositories/prisma/prisma-video-repository";
import { PrismaArticleRepository } from "../../repositories/prisma/prisma-article-repository";
import { PrismaQuizRepository } from "../../repositories/prisma/prisma-quiz-repository";
import { PrismaProjectRepository } from "../../repositories/prisma/prisma-project-repository";
import { CreateLessonUseCase } from "../../use-cases/entities/Lesson/create";

export function makeCreateLessonUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const groupRepository = new PrismaGroupRepository();
  const usersRepository = new PrismaUsersRepository();
  const videoRepository = new PrismaVideoRepository();
  const articleRepository = new PrismaArticleRepository();
  const quizRepository = new PrismaQuizRepository();
  const projectRepository = new PrismaProjectRepository();
  const createLessonUseCase = new CreateLessonUseCase(
    lessonRepository,
    groupRepository,
    usersRepository,
    videoRepository,
    articleRepository,
    quizRepository,
    projectRepository
  );

  return createLessonUseCase;
}
