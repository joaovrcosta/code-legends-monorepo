import { PrismaCourseSkillRepository } from "../../repositories/prisma/prisma-course-skill-repository"
import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository"
import { PrismaLessonSkillRepository } from "../../repositories/prisma/prisma-lesson-skill-repository"
import { UpdateLessonSkillsConfigUseCase } from "../../use-cases/entities/Lesson/update-skills-config"

export function makeUpdateLessonSkillsConfigUseCase() {
  const lessonRepository = new PrismaLessonRepository()
  const lessonSkillRepository = new PrismaLessonSkillRepository()
  const courseSkillRepository = new PrismaCourseSkillRepository()
  return new UpdateLessonSkillsConfigUseCase(
    lessonRepository,
    lessonSkillRepository,
    courseSkillRepository,
  )
}

