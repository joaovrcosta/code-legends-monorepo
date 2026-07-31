'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  listLabCodeAttempts,
  type LabCodeAttemptSummary,
} from '@/actions/lesson/lab-code-attempts'

const RESULT_LABEL: Record<string, string> = {
  pass: 'Passou',
  fail: 'Falhou',
  timeout: 'Tempo esgotado',
  error: 'Erro',
}

export function LabAttemptsPanel({
  lessonId,
  stepId,
  refreshKey,
  onRestoreCode,
}: {
  lessonId: number
  stepId?: string
  /** Incrementa para recarregar após um Verificar. */
  refreshKey?: number
  onRestoreCode?: (files: Record<string, string>) => void
}) {
  const [attempts, setAttempts] = useState<LabCodeAttemptSummary[]>([])
  const [filterStep, setFilterStep] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await listLabCodeAttempts(lessonId, {
        stepId: filterStep ? stepId : undefined,
        take: 20,
      })
      setAttempts(rows)
    } finally {
      setLoading(false)
    }
  }, [lessonId, stepId, filterStep])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  return (
    <div className="space-y-3 px-4 pb-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-white/50">
          Tentativas do Verificar (histórico pedagógico).
        </p>
        <label className="flex items-center gap-1.5 text-xs text-white/60">
          <input
            type="checkbox"
            checked={filterStep}
            onChange={(e) => setFilterStep(e.target.checked)}
            className="rounded border-white/20"
          />
          Só este step
        </label>
      </div>
      {loading ? (
        <p className="text-xs text-white/40">Carregando…</p>
      ) : attempts.length === 0 ? (
        <p className="text-xs text-white/40">Nenhuma tentativa salva ainda.</p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {attempts.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-[#25252A] bg-[#161618] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-white/90">
                  {RESULT_LABEL[a.result] ?? a.result}
                  <span className="ml-2 font-normal text-white/40">
                    {a.stepId}
                  </span>
                </p>
                <p className="text-[11px] text-white/40">
                  {new Date(a.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              {onRestoreCode ? (
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-medium text-[#86efac] hover:underline"
                  onClick={() => onRestoreCode(a.files)}
                >
                  Usar este código
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
