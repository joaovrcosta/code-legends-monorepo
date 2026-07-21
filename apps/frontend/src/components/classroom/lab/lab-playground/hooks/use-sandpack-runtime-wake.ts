'use client'

import {
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
} from 'react'
import { WAKING_TIMEOUT_MS } from '../constants'

type ListenFn = (handler: (msg: unknown) => void) => () => void

type SandpackRunRef = {
  runSandpack?: () => void
}

export function useSandpackRuntimeWake({
  runtimeGateEnabled,
  setRuntimeHot,
  setWantsRuntimeHot,
  listenRef,
  sandpackRef,
  refreshPreview,
}: {
  runtimeGateEnabled: boolean
  setRuntimeHot: (hot: boolean) => void
  setWantsRuntimeHot: (hot: boolean) => void
  listenRef: MutableRefObject<ListenFn>
  sandpackRef: MutableRefObject<SandpackRunRef>
  refreshPreview: () => void
}) {
  const isWakingRef = useRef(false)
  const wakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wakingUnsubRef = useRef<(() => void) | null>(null)

  const clearWaking = useCallback(() => {
    isWakingRef.current = false
    if (wakingTimeoutRef.current) {
      clearTimeout(wakingTimeoutRef.current)
      wakingTimeoutRef.current = null
    }
    if (wakingUnsubRef.current) {
      wakingUnsubRef.current()
      wakingUnsubRef.current = null
    }
  }, [])

  const wakeRuntime = useCallback(
    (mode: 'run' | 'refresh') => {
      setRuntimeHot(true)
      setWantsRuntimeHot(true)

      if (!runtimeGateEnabled) {
        if (mode === 'refresh') refreshPreview()
        return
      }

      const dispatchWakeAction = () => {
        if (mode === 'refresh') {
          refreshPreview()
          return
        }
        try {
          const run = sandpackRef.current.runSandpack
          if (typeof run === 'function') {
            run.call(sandpackRef.current)
          }
        } catch {
          // ignore — pendingCheck do Jest espera initialize_tests
        }
      }

      if (isWakingRef.current) {
        window.setTimeout(dispatchWakeAction, 0)
        return
      }
      isWakingRef.current = true

      wakingUnsubRef.current = listenRef.current((msg) => {
        const data = msg as { type?: string }
        if (data.type === 'done' || data.type === 'success') {
          clearWaking()
        }
      })
      wakingTimeoutRef.current = setTimeout(clearWaking, WAKING_TIMEOUT_MS)

      // Espera o commit de autoReload:true antes de run/refresh.
      window.setTimeout(dispatchWakeAction, 0)
    },
    [
      runtimeGateEnabled,
      setRuntimeHot,
      setWantsRuntimeHot,
      refreshPreview,
      clearWaking,
      listenRef,
      sandpackRef,
    ],
  )

  useEffect(
    () => () => {
      clearWaking()
    },
    [clearWaking],
  )

  return { wakeRuntime, clearWaking }
}
