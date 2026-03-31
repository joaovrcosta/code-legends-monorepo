import { ICourseSkillRepository } from "../../../repositories/course-skill-repository"
import { ILessonRepository } from "../../../repositories/lesson-repository"
import { ILessonSkillRepository } from "../../../repositories/lesson-skill-repository"
import { LessonNotFoundError } from "../../errors/lesson-not-found"
import { LessonSkillAlreadyInCourseError } from "../../errors/lesson-skill-already-in-course"

export class UpdateLessonSkillsConfigUseCase {
  constructor(
    private lessonRepository: ILessonRepository,
    private lessonSkillRepository: ILessonSkillRepository,
    private courseSkillRepository: ICourseSkillRepository,
  ) {}

  async execute(params: {
    lessonId: number
    skills: Array<{ skillId: string; weight: number }>
  }) {
    const lessonExists = await this.lessonRepository.findById(params.lessonId)
    if (!lessonExists) throw new LessonNotFoundError()

    const courseId = await this.lessonRepository.findCourseIdByLessonId(params.lessonId)
    if (!courseId) throw new LessonNotFoundError()

    const invalidSkillIds = await this.courseSkillRepository.findCourseSkillIdsIn(
      courseId,
      params.skills.map((s) => s.skillId),
    )

    if (invalidSkillIds.length > 0) {
      throw new LessonSkillAlreadyInCourseError(invalidSkillIds)
    }

    const skills = await this.lessonSkillRepository.replaceConfigForLesson(
      params.lessonId,
      params.skills,
    )

    return { lessonId: params.lessonId, skills }
  }
}

