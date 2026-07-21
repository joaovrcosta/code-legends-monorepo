'use client'

import { useLayoutEffect, useRef } from 'react'
import { useSandpack } from '@codesandbox/sandpack-react'
import { isManagedLabStepTestPath } from './utils/file-paths'

export function SyncStepTests({
  stepId,
  testFiles,
}: {
  stepId: string
  testFiles: Record<string, string>
}) {
  // Troca o arquivo de teste do step e remove os dos steps anteriores.
  // run-all-tests do Sandpack executa TODOS os *.test.js — sem delete, o
  // step-1 continua passando junto com o step-2.
  //
  // Importante: NÃO depender de `sandpack` no effect — a identidade muda após
  // updateFile e gerava loop de rebundle (dezenas de postMessage/s idle).
  const { sandpack } = useSandpack()
  const sandpackRef = useRef(sandpack)
  sandpackRef.current = sandpack

  useLayoutEffect(() => {
    const sp = sandpackRef.current
    const keep = new Set(Object.keys(testFiles))

    for (const [path, code] of Object.entries(testFiles)) {
      if (sp.files[path]?.code === code) continue
      try {
        sp.updateFile(path, code)
      } catch {
        // ignore
      }
    }

    for (const path of Object.keys(sp.files)) {
      if (!isManagedLabStepTestPath(path)) continue
      if (keep.has(path)) continue
      const inactive = '/* inactive lab step */\n'
      try {
        // Prefer delete; fallback esvazia o arquivo para o Jest não herdar testes velhos.
        if (typeof sp.deleteFile === 'function') {
          sp.deleteFile(path)
        } else if (sp.files[path]?.code !== inactive) {
          sp.updateFile(path, inactive)
        }
      } catch {
        try {
          if (sp.files[path]?.code !== inactive) {
            sp.updateFile(path, inactive)
          }
        } catch {
          // ignore
        }
      }
    }
  }, [stepId, testFiles])

  return null
}
