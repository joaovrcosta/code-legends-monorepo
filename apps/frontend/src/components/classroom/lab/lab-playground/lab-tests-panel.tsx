'use client'

import type { SpecsMap, TestStatus } from './types'
import { countSpecResults } from './utils/spec-results'

export function LabTestsPanel({
  status,
  specs,
}: {
  status: TestStatus
  specs: SpecsMap
}) {
  const { passed, total, failed } = countSpecResults(specs)
  const entries = Object.entries(specs)

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 text-sm text-white/90">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-medium text-white">Tests</span>
        <span className="text-xs uppercase tracking-wide text-white/50">
          {status === 'idle' && 'Pronto'}
          {status === 'starting' && 'Iniciando…'}
          {status === 'running' && 'Rodando…'}
          {status === 'complete' && 'Concluído'}
        </span>
      </div>

      {status === 'running' && total === 0 ? (
        <p className="text-white/50">Executando testes…</p>
      ) : null}

      {entries.map(([path, spec]) => (
        <div key={path} className="space-y-1">
          <p className="font-mono text-xs text-white/60">{path}</p>
          {spec.error ? (
            <p className="text-red-300">
              {typeof spec.error === 'string'
                ? spec.error
                : spec.error.message ?? String(spec.error)}
            </p>
          ) : null}
          {Object.entries(spec.tests ?? {}).map(([name, test]) => (
            <div key={name} className="flex items-start gap-2">
              <span
                className={
                  test.status === 'pass'
                    ? 'text-emerald-400'
                    : test.status === 'fail'
                      ? 'text-red-400'
                      : 'text-white/40'
                }
              >
                {test.status === 'pass' ? '✓' : test.status === 'fail' ? '✗' : '·'}
              </span>
              <span className="text-white/80">{name}</span>
            </div>
          ))}
        </div>
      ))}

      {status === 'complete' && total > 0 ? (
        <p className="mt-auto border-t border-white/10 pt-2 text-xs text-white/60">
          {failed > 0
            ? `${failed} falhou, ${passed} passou · ${total} total`
            : `${passed} passou · ${total} total`}
        </p>
      ) : null}
    </div>
  )
}
