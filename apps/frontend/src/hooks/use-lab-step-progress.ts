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
    files: stored.files,
    filesUpdatedAt: stored.filesUpdatedAt,
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
  const [workspaceFiles, setWorkspaceFiles] = useState<
    Record<string, string> | undefined
  >(undefined)
  const [hydrated, setHydrated] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRef = useRef<LabProgressState | null>(null)
  const hydratedRef = useRef(false)
  const completedStepIdsRef = useRef(completedStepIds)
  completedStepIdsRef.current = completedStepIds
  const currentStepIdRef = useRef(currentStepId)
  currentStepIdRef.current = currentStepId

  const buildState = useCallback(
    (
      completed: string[],
      current: string,
      files: Record<string, string> | undefined,
    ): LabProgressState => ({
      completedStepIds: completed,
      currentStepId: current,
      completedCount: completed.length,
      currentStepIndex: Math.max(0, allStepIds.indexOf(current)),
      ...(files !== undefined
        ? { files, filesUpdatedAt: new Date().toISOString() }
        : {}),
    }),
    [allStepIds],
  )

  const persist = useCallback(
    (state: LabProgressState, debounceMs = 400) => {
      latestRef.current = state
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        void saveLabProgress(lessonId, state)
      }, debounceMs)
    },
    [lessonId],
  )

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      if (lessonStatus === 'completed') {
        // Completou no meio da sessão: não mexer em workspaceFiles — isso
        // muda props do Sandpack e reseta o editor para o starter (o código
        // atual só está no Sandpack + latestRef / API do Verificar).
        if (hydratedRef.current) {
          if (cancelled) return
          setCompletedStepIds(allStepIds)
          setCurrentStepId(lastStepId)
          const files = latestRef.current?.files
          const doneState = buildState(allStepIds, lastStepId, files)
          latestRef.current = doneState
          void saveLabProgress(lessonId, doneState)
          return
        }

        const fromApi = await getLabProgress(lessonId)
        const doneState: LabProgressState = {
          completedStepIds: allStepIds,
          currentStepId: lastStepId,
          completedCount: allStepIds.length,
          currentStepIndex: Math.max(0, allStepIds.length - 1),
          files: fromApi?.files,
          filesUpdatedAt: fromApi?.filesUpdatedAt,
        }
        if (!cancelled) {
          setCompletedStepIds(allStepIds)
          setCurrentStepId(lastStepId)
          setWorkspaceFiles(fromApi?.files)
          latestRef.current = doneState
          hydratedRef.current = true
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
        setWorkspaceFiles(undefined)
        hydratedRef.current = true
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
      setWorkspaceFiles(resolved.files)
      latestRef.current = resolved
      hydratedRef.current = true
      setHydrated(true)

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
    buildState,
  ])

  // Troca de aula: permite hydrate completo de novo.
  useEffect(() => {
    hydratedRef.current = false
    setHydrated(false)
    latestRef.current = null
  }, [lessonId])

  useEffect(() => {
    if (!hydrated || !currentStepId) return
    const files = latestRef.current?.files ?? workspaceFiles
    const state = buildState(completedStepIds, currentStepId, files)
    latestRef.current = state
    persist(state, 400)
  }, [
    lessonId,
    completedStepIds,
    currentStepId,
    hydrated,
    buildState,
    persist,
    // workspaceFiles intencionalmente omitido — autosave próprio
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

  /**
   * Persiste workspace no lab-progress.
   * Usado no Verificar e no restore de tentativa — não na digitação.
   */
  const updateWorkspaceFiles = useCallback(
    (
      files: Record<string, string>,
      options?: { applyToState?: boolean },
    ) => {
      if (options?.applyToState) {
        setWorkspaceFiles(files)
      }

      const base = latestRef.current
      const state = buildState(
        base?.completedStepIds ?? completedStepIdsRef.current,
        base?.currentStepId ?? currentStepIdRef.current,
        files,
      )
      latestRef.current = state
      void saveLabProgress(lessonId, state)
    },
    [buildState, lessonId],
  )

  const clearProgress = useCallback(() => {
    clearLegacyProgress(lessonId)
    const next: LabProgressState = {
      completedStepIds: [],
      currentStepId: firstStepId,
      completedCount: 0,
      currentStepIndex: 0,
      files: {},
      filesUpdatedAt: new Date().toISOString(),
    }
    latestRef.current = next
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setCompletedStepIds([])
    setCurrentStepId(firstStepId)
    setWorkspaceFiles({})
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
    hydrated,
    workspaceFiles,
    updateWorkspaceFiles,
  }
}
