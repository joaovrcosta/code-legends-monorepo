'use client'

import { useEffect, useRef, useState } from 'react'
import { useSandpackConsole } from '@codesandbox/sandpack-react'
import { CONSOLE_LATE_WINDOW_MS } from './constants'
import type { SandpackConsoleLog } from './types'
import {
  collapseDuplicatedRun,
  formatConsolePart,
  logFingerprint,
} from './utils/console-logs'

/**
 * Console só exibe saída capturada no "Verificar" (ignora autorun ao digitar).
 * A captura começa no fim do check (após os testes), com um único refresh.
 */
export function LabVerifyConsole({
  sessionId,
  capturing,
  onCaptureLogsChange,
}: {
  sessionId: number
  capturing: boolean
  onCaptureLogsChange?: (logs: SandpackConsoleLog[]) => void
}) {
  const { logs, reset } = useSandpackConsole({
    resetOnPreviewRestart: false,
    showSyntaxError: false,
  })
  const [snapshot, setSnapshot] = useState<SandpackConsoleLog[]>([])
  const wasCapturingRef = useRef(false)
  const lateUntilRef = useRef(0)
  const resetRef = useRef(reset)
  const onLogsRef = useRef(onCaptureLogsChange)
  resetRef.current = reset
  onLogsRef.current = onCaptureLogsChange

  useEffect(() => {
    if (sessionId <= 0) {
      wasCapturingRef.current = false
      lateUntilRef.current = 0
      setSnapshot((prev) => (prev.length === 0 ? prev : []))
      return
    }

    // Sempre limpa ao (re)iniciar captura nesta sessão — senão logs de um
    // Verificar anterior vazam (ex.: "12" fantasma no step 2).
    if (capturing) {
      wasCapturingRef.current = true
      lateUntilRef.current = 0
      resetRef.current()
      setSnapshot([])
      onLogsRef.current?.([])
    }
  }, [sessionId, capturing])

  useEffect(() => {
    if (sessionId <= 0) return
    const typed = collapseDuplicatedRun(logs as SandpackConsoleLog[])
    if (capturing) {
      onLogsRef.current?.(typed)
      return
    }
    if (wasCapturingRef.current) {
      wasCapturingRef.current = false
      // Janela curta só para logs atrasados da MESMA execução — não para um 2º run.
      lateUntilRef.current = Date.now() + CONSOLE_LATE_WINDOW_MS
      setSnapshot(typed)
      onLogsRef.current?.(typed)
      return
    }
    if (Date.now() < lateUntilRef.current && typed.length > 0) {
      // Só atualiza se ainda for o mesmo ciclo (sem dobrar a saída).
      setSnapshot((prev) => {
        if (prev.length === 0) return typed
        if (typed.length <= prev.length) return prev
        const prevFp = prev.map(logFingerprint).join('\u0001')
        const nextFp = typed.map(logFingerprint).join('\u0001')
        if (nextFp.startsWith(prevFp) && nextFp.length > prevFp.length) {
          // Cresceu com prefixo igual — se o extra for repetição do prev, ignora.
          const extra = typed.slice(prev.length)
          const extraFp = extra.map(logFingerprint)
          const baseFp = prev.map(logFingerprint)
          if (extraFp.every((fp, i) => fp === baseFp[i])) return prev
          return typed
        }
        return prev
      })
      onLogsRef.current?.(typed)
    }
  }, [logs, capturing, sessionId])

  const display: SandpackConsoleLog[] =
    sessionId <= 0
      ? []
      : capturing
        ? collapseDuplicatedRun(logs as SandpackConsoleLog[])
        : snapshot

  return (
    <div className="h-full min-h-0 overflow-auto bg-[#1A1A1A] p-2 font-mono text-xs leading-relaxed text-white/90">
      {display.length === 0 ? (
        <p className="text-white/35">
          {sessionId > 0
            ? capturing
              ? 'Capturando saída…'
              : 'Sem saída neste Verificar.'
            : 'Clique em Verificar para ver a saída do console.'}
        </p>
      ) : (
        <div className="space-y-1">
          {display.map((log) => (
            <div
              key={log.id}
              className={
                log.method === 'error'
                  ? 'text-red-300'
                  : log.method === 'warn'
                    ? 'text-amber-300'
                    : 'text-white/85'
              }
            >
              {(log.data ?? []).map((part, index) => (
                <span key={`${log.id}-${index}`}>
                  {formatConsolePart(part)}{' '}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
