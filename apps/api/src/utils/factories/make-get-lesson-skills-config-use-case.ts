import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository"
import { PrismaLessonSkillRepository } from "../../repositories/prisma/prisma-lesson-skill-repository"
import { GetLessonSkillsConfigUseCase } from "../../use-cases/entities/Lesson/get-skills-config"

export function makeGetLessonSkillsConfigUseCase() {
  const lessonRepository = new PrismaLessonRepository()
  const lessonSkillRepository = new PrismaLessonSkillRepository()
  return new GetLessonSkillsConfigUseCase(lessonRepository, lessonSkillRepository)
}

