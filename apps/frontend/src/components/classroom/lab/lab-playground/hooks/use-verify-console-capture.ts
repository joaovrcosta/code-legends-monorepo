'use client'

import { useCallback, useRef, useState } from 'react'
import type { SandpackConsoleLog } from '../types'

export function useVerifyConsoleCapture() {
  /** Sessão do console: só captura logs durante Verificar. */
  const [consoleSessionId, setConsoleSessionId] = useState(0)
  const [consoleCapturing, setConsoleCapturing] = useState(false)
  const verifyConsoleLogsRef = useRef<SandpackConsoleLog[]>([])
  const consoleFreezeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Timeout de 200ms que inicia captura pós-Verificar (precisa cancelar em clique rápido). */
  const consoleCaptureStartRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  /** Delay do refresh pós-captura. */
  const consoleRefreshDelayRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  /** Unsubscribe do listen de endChecking — órfão causa refresh que aborta o Jest. */
  const endCheckingUnsubRef = useRef<(() => void) | null>(null)
  /** Geração do settle atual; invalida callbacks atrasados. */
  const endCheckingGenRef = useRef(0)

  const handleCaptureLogsChange = useCallback((logs: SandpackConsoleLog[]) => {
    verifyConsoleLogsRef.current = logs
  }, [])

  /**
   * Cancela timers/listen do pós-Verificar. Crítico: se o aluno clicar de novo
   * antes do settle, um refresh atrasado aborta o Jest e trava em "Verificando…".
   */
  const clearConsoleFreeze = useCallback(() => {
    endCheckingGenRef.current += 1
    if (consoleFreezeRef.current) {
      clearTimeout(consoleFreezeRef.current)
      consoleFreezeRef.current = null
    }
    if (consoleCaptureStartRef.current) {
      clearTimeout(consoleCaptureStartRef.current)
      consoleCaptureStartRef.current = null
    }
    if (consoleRefreshDelayRef.current) {
      clearTimeout(consoleRefreshDelayRef.current)
      consoleRefreshDelayRef.current = null
    }
    if (endCheckingUnsubRef.current) {
      endCheckingUnsubRef.current()
      endCheckingUnsubRef.current = null
    }
  }, [])

  return {
    consoleSessionId,
    setConsoleSessionId,
    consoleCapturing,
    setConsoleCapturing,
    verifyConsoleLogsRef,
    handleCaptureLogsChange,
    clearConsoleFreeze,
    consoleFreezeRef,
    consoleCaptureStartRef,
    consoleRefreshDelayRef,
    endCheckingUnsubRef,
    endCheckingGenRef,
  }
}
