import type { LessonType } from '@/types/roadmap'

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
  /** Resumo por tipo: lições, artigos, questionários, etc. (só tipos com quantidade > 0) */
  subtitle: string
  progress: number
  lessons: StudyProgramLessonLine[]
}

/**
 * Ex.: "4 lições · 2 artigos · 1 questionário" — apenas tipos presentes no módulo.
 */
export function formatModuleContentBreakdown(types: LessonType[]): string {
  let video = 0
  let article = 0
  let text = 0
  let quiz = 0
  let multi_quiz = 0
  let project = 0

  for (const t of types) {
    switch (t) {
      case 'video':
        video++
        break
      case 'article':
        article++
        break
      case 'text':
        text++
        break
      case 'quiz':
        quiz++
        break
      case 'multi_quiz':
        multi_quiz++
        break
      case 'project':
        project++
        break
      default:
        break
    }
  }

  const parts: string[] = []
  if (video > 0) {
    parts.push(video === 1 ? '1 lição' : `${video} lições`)
  }
  if (article > 0) {
    parts.push(article === 1 ? '1 artigo' : `${article} artigos`)
  }
  if (text > 0) {
    parts.push(
      text === 1 ? '1 informativo' : `${text} informativos`,
    )
  }
  const quizzes = quiz + multi_quiz
  if (quizzes > 0) {
    parts.push(
      quizzes === 1 ? '1 questionário' : `${quizzes} questionários`,
    )
  }
  if (project > 0) {
    parts.push(project === 1 ? '1 projeto' : `${project} projetos`)
  }

  return parts.length > 0 ? parts.join(' · ') : 'Sem conteúdo'
}
