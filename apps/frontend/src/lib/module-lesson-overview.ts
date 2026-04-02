import type { LessonType } from '@/types/roadmap'

/** Item serializável para a grade de lições do módulo na overview */
export type ModuleLessonGridItem = {
  id: number
  title: string
  href: string
  categoryLabel: string
  isCurrent: boolean
  isLocked: boolean
}

export function mapLessonTypeToCategoryLabel(type: LessonType): string {
  switch (type) {
    case 'text':
      return 'Informativo'
    case 'article':
      return 'Artigo'
    case 'video':
      return 'Lição'
    case 'quiz':
    case 'multi_quiz':
      return 'Questionário'
    case 'project':
      return 'Projeto'
    default:
      return 'Lição'
  }
}
