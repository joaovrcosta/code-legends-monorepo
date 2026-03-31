export class LessonSkillAlreadyInCourseError extends Error {
  invalidSkillIds: string[]

  constructor(invalidSkillIds: string[]) {
    super("Não é permitido associar na aula uma skill que já exista no curso.")
    this.invalidSkillIds = invalidSkillIds
  }
}

