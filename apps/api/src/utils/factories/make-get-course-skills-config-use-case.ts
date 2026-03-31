import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository"
import { PrismaCourseSkillRepository } from "../../repositories/prisma/prisma-course-skill-repository"
import { GetCourseSkillsConfigUseCase } from "../../use-cases/entities/Course/get-skills-config"

export function makeGetCourseSkillsConfigUseCase() {
  const courseRepository = new PrismaCourseRepository()
  const courseSkillRepository = new PrismaCourseSkillRepository()
  return new GetCourseSkillsConfigUseCase(courseRepository, courseSkillRepository)
}

