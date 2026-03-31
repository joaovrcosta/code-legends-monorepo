export type SkillConfigItem = {
  skillId: string
  name: string
  slug: string
  description?: string | null
  weight: number
}

export interface ILessonSkillRepository {
  listConfigByLessonId(lessonId: number): Promise<SkillConfigItem[]>
  replaceConfigForLesson(
    lessonId: number,
    skills: Array<{ skillId: string; weight: number }>,
  ): Promise<SkillConfigItem[]>
}

