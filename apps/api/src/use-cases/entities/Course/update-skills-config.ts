import { ICourseRepository } from "../../../repositories/course-repository"
import { ICourseSkillRepository } from "../../../repositories/course-skill-repository"
import { CourseNotFoundError } from "../../errors/course-not-found"

export class UpdateCourseSkillsConfigUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private courseSkillRepository: ICourseSkillRepository,
  ) {}

  async execute(params: {
    courseId: string
    skills: Array<{ skillId: string; weight: number }>
  }) {
    const course = await this.courseRepository.findById(params.courseId)
    if (!course) throw new CourseNotFoundError()

    const skills = await this.courseSkillRepository.replaceConfigForCourse(
      params.courseId,
      params.skills,
    )

    return { courseId: params.courseId, skills }
  }
}

