import { ICourseRepository } from "../../../repositories/course-repository"
import { ICourseSkillRepository } from "../../../repositories/course-skill-repository"
import { CourseNotFoundError } from "../../errors/course-not-found"

export class GetCourseSkillsConfigUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private courseSkillRepository: ICourseSkillRepository,
  ) {}

  async execute(courseId: string) {
    const course = await this.courseRepository.findById(courseId)
    if (!course) throw new CourseNotFoundError()

    const skills = await this.courseSkillRepository.listConfigByCourseId(courseId)

    return { courseId, skills }
  }
}

