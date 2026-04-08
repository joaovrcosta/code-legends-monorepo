export type SkillConfigItem = {
  skillId: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  weight: number
}

export interface ICourseSkillRepository {
  listConfigByCourseId(courseId: string): Promise<SkillConfigItem[]>
  replaceConfigForCourse(
    courseId: string,
    skills: Array<{ skillId: string; weight: number }>,
  ): Promise<SkillConfigItem[]>
  findCourseSkillIdsIn(
    courseId: string,
    skillIds: string[],
  ): Promise<string[]>
}

