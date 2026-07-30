'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LabStep } from '@/types/roadmap'
import {
  getLabProgress,
  saveLabProgress,
  type LabProgressState,
} from '@/actions/lesson/lab-progress'

const LEGACY_STORAGE_PREFIX = 'lab-progress:'

function legacyStorageKey(lessonId: number) {
  return `${LEGACY_STORAGE_PREFIX}${lessonId}`
}

function readLegacyProgress(lessonId: number): LabProgressState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(legacyStorageKey(lessonId))
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

function clearLegacyProgress(lessonId: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(legacyStorageKey(lessonId))
  } catch {
    // ignore
  }
}

/** Mantido para reset de curso: limpa leftovers antigos do browser. */
export function clearAllLabProgress() {
  if (typeof window === 'undefined') return
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key?.startsWith(LEGACY_STORAGE_PREFIX)) toRemove.push(key)
    }
    for (const key of toRemove) localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export type { LabProgressState }

/**
 * Reconstrói progresso quando os ids dos steps mudaram (lab regenerado),
 * usando índices/contagem salvos.
 */
function resolveProgressFromStore(
  stored: LabProgressState,
  allStepIds: string[],
  firstStepId: string,
  lastStepId: string,
): LabProgressState {
  const validIds = new Set(allStepIds)
  let nextCompleted = stored.completedStepIds.filter((id) => validIds.has(id))
  let nextCurrent = validIds.has(stored.currentStepId)
    ? stored.currentStepId
    : ''

  const idsIntact =
    nextCompleted.length === stored.completedStepIds.length &&
    Boolean(nextCurrent)

  if (!idsIntact && allStepIds.length > 0) {
    const countFromStore =
      typeof stored.completedCount === 'number'
        ? stored.completedCount
        : stored.completedStepIds.length
    const n = Math.min(Math.max(0, countFromStore), allStepIds.length)
    nextCompleted = allStepIds.slice(0, n)

    if (
      typeof stored.currentStepIndex === 'number' &&
      stored.currentStepIndex >= 0
    ) {
      const idx = Math.min(stored.currentStepIndex, allStepIds.length - 1)
      nextCurrent = allStepIds[idx] ?? firstStepId
    } else {
      nextCurrent = allStepIds[Math.min(n, allStepIds.length - 1)] ?? firstStepId
    }
  }

  if (!nextCurrent) {
    if (nextCompleted.length < allStepIds.length) {
      nextCurrent = allStepIds[nextCompleted.length] ?? firstStepId
    } else {
      nextCurrent = nextCompleted.length > 0 ? lastStepId : firstStepId
    }
  }

  return {
    completedStepIds: nextCompleted,
    currentStepId: nextCurrent,
    completedCount: nextCompleted.length,
    currentStepIndex: Math.max(0, allStepIds.indexOf(nextCurrent)),
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRef = useRef<LabProgressState | null>(null)

  const persist = useCallback(
    (state: LabProgressState) => {
      latestRef.current = state
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        void saveLabProgress(lessonId, state)
      }, 400)
    },
    [lessonId],
  )

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      if (lessonStatus === 'completed') {
        const doneState: LabProgressState = {
          completedStepIds: allStepIds,
          currentStepId: lastStepId,
          completedCount: allStepIds.length,
          currentStepIndex: Math.max(0, allStepIds.length - 1),
        }
        if (!cancelled) {
          setCompletedStepIds(allStepIds)
          setCurrentStepId(lastStepId)
          setHydrated(true)
          void saveLabProgress(lessonId, doneState)
        }
        return
      }

      const fromApi = await getLabProgress(lessonId)
      const legacy = !fromApi ? readLegacyProgress(lessonId) : null
      const stored = fromApi ?? legacy

      if (cancelled) return

      if (!stored) {
        setCompletedStepIds([])
        setCurrentStepId(firstStepId)
        setHydrated(true)
        return
      }

      const resolved = resolveProgressFromStore(
        stored,
        allStepIds,
        firstStepId,
        lastStepId,
      )
      setCompletedStepIds(resolved.completedStepIds)
      setCurrentStepId(resolved.currentStepId)
      setHydrated(true)

      // Migra localStorage → API uma vez.
      if (legacy && !fromApi) {
        void saveLabProgress(lessonId, resolved).then(() => {
          clearLegacyProgress(lessonId)
        })
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [
    lessonId,
    lessonStatus,
    firstStepId,
    lastStepId,
    allStepIds,
  ])

  useEffect(() => {
    if (!hydrated || !currentStepId) return
    persist({
      completedStepIds,
      currentStepId,
      completedCount: completedStepIds.length,
      currentStepIndex: Math.max(0, allStepIds.indexOf(currentStepId)),
    })
  }, [
    lessonId,
    completedStepIds,
    currentStepId,
    hydrated,
    allStepIds,
    persist,
  ])

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      const pending = latestRef.current
      if (pending) void saveLabProgress(lessonId, pending)
    },
    [lessonId],
  )

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
      // Só avança se o step concluído ainda é o atual (evita pass atrasado
      // do step-1 empurrar progresso depois que o aluno já está no step-2).
      setCurrentStepId((current) => {
        if (current !== stepId) return current
        const idx = steps.findIndex((s) => s.id === stepId)
        return idx >= 0 ? (steps[idx + 1]?.id ?? current) : current
      })
    },
    [steps],
  )

  const completeCurrentStep = useCallback(() => {
    if (!currentStep) return
    completeStep(currentStep.id)
  }, [completeStep, currentStep])

  const clearProgress = useCallback(() => {
    clearLegacyProgress(lessonId)
    const next: LabProgressState = {
      completedStepIds: [],
      currentStepId: firstStepId,
      completedCount: 0,
      currentStepIndex: 0,
    }
    latestRef.current = next
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setCompletedStepIds([])
    setCurrentStepId(firstStepId)
    void saveLabProgress(lessonId, next)
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
