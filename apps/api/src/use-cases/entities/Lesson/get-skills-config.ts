import { ILessonRepository } from "../../../repositories/lesson-repository"
import { ILessonSkillRepository } from "../../../repositories/lesson-skill-repository"
import { LessonNotFoundError } from "../../errors/lesson-not-found"

export class GetLessonSkillsConfigUseCase {
  constructor(
    private lessonRepository: ILessonRepository,
    private lessonSkillRepository: ILessonSkillRepository,
  ) {}

  async execute(lessonId: number) {
    const lesson = await this.lessonRepository.findById(lessonId)
    if (!lesson) throw new LessonNotFoundError()

    const skills = await this.lessonSkillRepository.listConfigByLessonId(lessonId)

    return { lessonId, skills }
  }
}

