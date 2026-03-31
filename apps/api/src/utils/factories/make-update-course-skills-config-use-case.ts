import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository"
import { PrismaCourseSkillRepository } from "../../repositories/prisma/prisma-course-skill-repository"
import { UpdateCourseSkillsConfigUseCase } from "../../use-cases/entities/Course/update-skills-config"

export function makeUpdateCourseSkillsConfigUseCase() {
  const courseRepository = new PrismaCourseRepository()
  const courseSkillRepository = new PrismaCourseSkillRepository()
  return new UpdateCourseSkillsConfigUseCase(courseRepository, courseSkillRepository)
}

