import type { ContinueCourseResult } from '@/actions/course/continue'

type ModuleStatsResult = Pick<
  ContinueCourseResult,
  | 'moduleNewlyCompleted'
  | 'moduleId'
  | 'moduleTitle'
  | 'progress'
  | 'xpGained'
  | 'xpGainedInModule'
  | 'xpGainedInModuleBySkill'
>

type ModuleCompletionInfo = {
  moduleCompleted: boolean
  moduleId?: string
  moduleTitle?: string
  progress?: number
  xpGained?: number
  xpGainedInModule?: number
  xpGainedInModuleBySkill?: { skillId: string; xp: number }[]
}

/** Exibe a tela de score do módulo só na primeira conclusão do módulo (não em revisões). */
export function applyModuleCompletionStatsIfNeeded(
  result: ModuleStatsResult,
  setLastModuleCompletion: (info: ModuleCompletionInfo | null) => void,
  setShowModuleStatsOnce: (value: boolean) => void,
  moduleTitleFallback?: string,
): boolean {
  if (!result.moduleNewlyCompleted) return false

  setLastModuleCompletion({
    moduleCompleted: true,
    moduleId: result.moduleId,
    moduleTitle: result.moduleTitle ?? moduleTitleFallback,
    progress: result.progress,
    xpGained: result.xpGained,
    xpGainedInModule: result.xpGainedInModule,
    xpGainedInModuleBySkill: result.xpGainedInModuleBySkill,
  })
  setShowModuleStatsOnce(true)
  return true
}
