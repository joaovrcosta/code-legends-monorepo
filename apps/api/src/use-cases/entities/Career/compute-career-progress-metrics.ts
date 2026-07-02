export type CareerProgressMetrics = {
  journeyProgress: number
  modulesCompleted: number
  modulesTotal: number
  modulesCompletionProgress: number
}

export function normalizeProgressPercent(progress: number): number {
  const percent =
    progress <= 1 ? Math.round(progress * 100) : Math.round(progress)
  return Math.max(0, Math.min(100, percent))
}

type ComputeCareerProgressMetricsInput = {
  courses: Array<{ progress: number }>
  exams: Array<{ bestScore: number | null }>
  modules: Array<{ isCompleted: boolean }>
}

export function computeCareerProgressMetrics(
  input: ComputeCareerProgressMetricsInput,
): CareerProgressMetrics {
  const steps: number[] = []

  for (const course of input.courses) {
    steps.push(normalizeProgressPercent(course.progress))
  }

  for (const exam of input.exams) {
    steps.push(
      exam.bestScore != null
        ? Math.max(0, Math.min(100, Math.round(exam.bestScore)))
        : 0,
    )
  }

  const journeyProgress = steps.length
    ? Math.round(steps.reduce((sum, value) => sum + value, 0) / steps.length)
    : 0

  const modulesTotal = input.modules.length
  const modulesCompleted = input.modules.filter((m) => m.isCompleted).length
  const modulesCompletionProgress = modulesTotal
    ? Math.round((modulesCompleted / modulesTotal) * 100)
    : 0

  return {
    journeyProgress,
    modulesCompleted,
    modulesTotal,
    modulesCompletionProgress,
  }
}
