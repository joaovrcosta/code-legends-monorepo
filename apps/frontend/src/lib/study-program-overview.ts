/** Linha de aula dentro de um módulo no accordion “Programa de estudos” */
export type StudyProgramLessonLine = {
  id: number
  title: string
  categoryLabel: string
  href: string
  isLocked: boolean
}

/** Um módulo do roadmap exibido no accordion */
export type StudyProgramModuleSection = {
  id: string
  title: string
  /** Resumo ex.: progresso e quantidade de aulas */
  subtitle: string
  progress: number
  lessons: StudyProgramLessonLine[]
}
