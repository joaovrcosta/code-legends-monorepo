'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LabStep } from '@/types/roadmap'

const STORAGE_PREFIX = 'lab-progress:'

export type LabProgressState = {
  completedStepIds: string[]
  currentStepId: string
}

function storageKey(lessonId: number) {
  return `${STORAGE_PREFIX}${lessonId}`
}

function readProgress(lessonId: number): LabProgressState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(lessonId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as LabProgressState
    if (
      !parsed ||
      typeof parsed.currentStepId !== 'string' ||
      !Array.isArray(parsed.completedStepIds)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeProgress(lessonId: number, state: LabProgressState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey(lessonId), JSON.stringify(state))
  } catch {
    // ignore quota / private mode
  }
}

export function clearLabProgress(lessonId: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(storageKey(lessonId))
  } catch {
    // ignore
  }
}

/** Limpa todos os labs salvos no browser (ex.: após resetar o curso). */
export function clearAllLabProgress() {
  if (typeof window === 'undefined') return
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) toRemove.push(key)
    }
    for (const key of toRemove) localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function useLabStepProgress(options: {
  lessonId: number
  steps: LabStep[]
  lessonStatus?: string
}) {
  const { lessonId, steps, lessonStatus } = options
  const stepIdsKey = steps.map((s) => s.id).join('|')
  const firstStepId = steps[0]?.id ?? ''
  const lastStepId = steps[steps.length - 1]?.id ?? firstStepId
  const allStepIds = useMemo(
    () => (stepIdsKey ? stepIdsKey.split('|') : []),
    [stepIdsKey],
  )

  const [completedStepIds, setCompletedStepIds] = useState<string[]>([])
  const [currentStepId, setCurrentStepId] = useState(firstStepId)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Aula já concluída: mostra todos os steps feitos e mantém o save.
    // Só apagamos no reset do curso (clearAllLabProgress).
    if (lessonStatus === 'completed') {
      const doneState: LabProgressState = {
        completedStepIds: allStepIds,
        currentStepId: lastStepId,
      }
      writeProgress(lessonId, doneState)
      setCompletedStepIds(allStepIds)
      setCurrentStepId(lastStepId)
      setHydrated(true)
      return
    }

    const stored = readProgress(lessonId)
    if (!stored) {
      setCompletedStepIds([])
      setCurrentStepId(firstStepId)
      setHydrated(true)
      return
    }

    const validIds = new Set(allStepIds)
    const nextCompleted = stored.completedStepIds.filter((id) =>
      validIds.has(id),
    )
    const nextCurrent = validIds.has(stored.currentStepId)
      ? stored.currentStepId
      : firstStepId
    setCompletedStepIds(nextCompleted)
    setCurrentStepId(nextCurrent)
    setHydrated(true)
  }, [lessonId, lessonStatus, firstStepId, lastStepId, allStepIds])

  useEffect(() => {
    if (!hydrated || !currentStepId) return
    writeProgress(lessonId, { completedStepIds, currentStepId })
  }, [lessonId, completedStepIds, currentStepId, hydrated])

  const currentStepIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === currentStepId),
  )
  const currentStep = steps[currentStepIndex] ?? steps[0] ?? null
  const allStepsDone =
    steps.length > 0 && steps.every((s) => completedStepIds.includes(s.id))

  const completeStep = useCallback(
    (stepId: string) => {
      setCompletedStepIds((prev) =>
        prev.includes(stepId) ? prev : [...prev, stepId],
      )
      const idx = steps.findIndex((s) => s.id === stepId)
      const next = idx >= 0 ? steps[idx + 1] : undefined
      if (next) {
        setCurrentStepId(next.id)
      }
    },
    [steps],
  )

  const completeCurrentStep = useCallback(() => {
    if (!currentStep) return
    completeStep(currentStep.id)
  }, [completeStep, currentStep])

  const clearProgress = useCallback(() => {
    clearLabProgress(lessonId)
    setCompletedStepIds([])
    setCurrentStepId(firstStepId)
  }, [lessonId, firstStepId])

  return {
    steps,
    currentStep,
    currentStepIndex,
    completedStepIds,
    allStepsDone,
    completeStep,
    completeCurrentStep,
    clearProgress,
  }
}
