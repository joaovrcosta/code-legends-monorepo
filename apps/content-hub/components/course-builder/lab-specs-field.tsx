'use client'

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { LAB_SPECS_PLACEHOLDER } from '@/lib/lab-specs-placeholder'
import {
  validateLabSpecs,
  type ValidateLabSpecsResult,
} from '@/lib/validate-lab-specs'

const LabSpecsCodemirror = dynamic(
  () =>
    import('./lab-specs-codemirror').then((m) => m.LabSpecsCodemirror),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-md border border-ch-border bg-ch-surface text-sm text-ch-muted">
        Carregando editor…
      </div>
    ),
  },
)

export type LabSpecsFieldHandle = {
  validate: () => ValidateLabSpecsResult
}

type LabSpecsFieldProps = {
  value: string
  onChange: (value: string) => void
  learnBody?: string
  learnTitle?: string
  category?: string
  durationMinutes?: string
  descriptionFallback?: string
  onValidationChange?: (result: ValidateLabSpecsResult) => void
}

const BLUR_VALIDATE_MS = 300

function StepTitleMarkdown({ title }: { title: string }) {
  try {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          p: ({ children }) => (
            <span className="inline [&>code]:rounded [&>code]:bg-black/10 [&>code]:px-1 [&>code]:font-mono [&>code]:text-[0.9em]">
              {children}
            </span>
          ),
          code: ({ children }) => (
            <code className="rounded bg-black/10 px-1 font-mono text-[0.9em]">
              {children}
            </code>
          ),
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          a: ({ children }) => <span>{children}</span>,
          ul: ({ children }) => <span>{children}</span>,
          ol: ({ children }) => <span>{children}</span>,
          li: ({ children }) => <span>{children}</span>,
          h1: ({ children }) => <span>{children}</span>,
          h2: ({ children }) => <span>{children}</span>,
          h3: ({ children }) => <span>{children}</span>,
          blockquote: ({ children }) => <span>{children}</span>,
          pre: ({ children }) => <span>{children}</span>,
        }}
      >
        {title}
      </ReactMarkdown>
    )
  } catch {
    return <span>{title}</span>
  }
}

function StudentPreview({
  learnBody,
  learnTitle,
  category,
  durationMinutes,
  descriptionFallback,
  specsJson,
}: {
  learnBody?: string
  learnTitle?: string
  category?: string
  durationMinutes?: string
  descriptionFallback?: string
  specsJson: string
}) {
  const parsedPreview = useMemo(() => {
    try {
      const data = JSON.parse(specsJson || '{}') as {
        steps?: Array<{
          id?: string
          title?: string
          hint?: string
          expected?: string
        }>
      }
      if (!Array.isArray(data.steps)) {
        return { ok: false as const, steps: [] }
      }
      return { ok: true as const, steps: data.steps }
    } catch {
      return { ok: false as const, steps: [] }
    }
  }, [specsJson])

  const hasLearn = Boolean(learnBody?.trim())
  const hasFallback = Boolean(descriptionFallback?.trim())

  return (
    <div className="space-y-4 rounded-md border border-ch-border bg-ch-surface p-4 text-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ch-muted">
          Desafio
        </p>
        {category ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ch-muted">
            {category}
          </p>
        ) : null}
        {learnTitle ? (
          <p className="font-medium text-ch-fg">{learnTitle}</p>
        ) : null}
        {durationMinutes && Number(durationMinutes) > 0 ? (
          <p className="text-xs text-ch-muted">{durationMinutes} min</p>
        ) : null}
        {hasLearn ? (
          <div className="prose prose-sm max-w-none prose-p:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
              {learnBody!}
            </ReactMarkdown>
          </div>
        ) : hasFallback ? (
          <p className="whitespace-pre-wrap text-ch-fg/90">
            {descriptionFallback}
          </p>
        ) : (
          <p className="text-ch-muted">Sem conteúdo explicativo.</p>
        )}
      </div>

      <div className="space-y-2 border-t border-ch-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ch-muted">
          Instruções
        </p>
        {!parsedPreview.ok ? (
          <p className="text-ch-muted">
            Corrija o JSON para ver o preview.
          </p>
        ) : parsedPreview.steps.length === 0 ? (
          <p className="text-ch-muted">Nenhum step no JSON.</p>
        ) : (
          <ol className="space-y-3">
            {parsedPreview.steps.map((step, index) => (
              <li key={step.id ?? `step-${index}`} className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold tabular-nums text-ch-fg">
                    {index + 1}.
                  </span>
                  <div className="min-w-0 flex-1 text-ch-fg">
                    {typeof step.title === 'string' && step.title.trim() ? (
                      <StepTitleMarkdown title={step.title} />
                    ) : (
                      <span className="text-ch-muted">(sem title)</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {step.hint ? (
                    <span className="rounded bg-ch-muted/15 px-1.5 py-0.5 text-[11px] text-ch-muted">
                      hint
                    </span>
                  ) : null}
                  {step.expected ? (
                    <span className="rounded bg-ch-muted/15 px-1.5 py-0.5 text-[11px] text-ch-muted">
                      expected
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export const LabSpecsField = forwardRef<
  LabSpecsFieldHandle,
  LabSpecsFieldProps
>(function LabSpecsField(
  {
    value,
    onChange,
    learnBody,
    learnTitle,
    category,
    durationMinutes,
    descriptionFallback,
    onValidationChange,
  },
  ref,
) {
  const [result, setResult] = useState<ValidateLabSpecsResult | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const skipBlurValidationRef = useRef(false)
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  const applyResult = useCallback(
    (next: ValidateLabSpecsResult) => {
      setResult(next)
      onValidationChange?.(next)
      return next
    },
    [onValidationChange],
  )

  const runValidate = useCallback(
    (raw?: string) => {
      const next = validateLabSpecs(raw ?? valueRef.current)
      return applyResult(next)
    },
    [applyResult],
  )

  useImperativeHandle(
    ref,
    () => ({
      validate: () => runValidate(),
    }),
    [runValidate],
  )

  const markToolbarPointer = useCallback(() => {
    skipBlurValidationRef.current = true
  }, [])

  const handleEditorBlur = useCallback(() => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    blurTimerRef.current = setTimeout(() => {
      blurTimerRef.current = null
      if (skipBlurValidationRef.current) {
        skipBlurValidationRef.current = false
        return
      }
      runValidate()
    }, BLUR_VALIDATE_MS)
  }, [runValidate])

  const handleInsertExample = useCallback(() => {
    skipBlurValidationRef.current = true
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current)
      blurTimerRef.current = null
    }
    onChange(LAB_SPECS_PLACEHOLDER)
    // Valida só o placeholder novo (evita flash do JSON antigo).
    queueMicrotask(() => {
      skipBlurValidationRef.current = false
      applyResult(validateLabSpecs(LAB_SPECS_PLACEHOLDER))
    })
  }, [applyResult, onChange])

  const handleValidateClick = useCallback(() => {
    skipBlurValidationRef.current = true
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current)
      blurTimerRef.current = null
    }
    runValidate()
    queueMicrotask(() => {
      skipBlurValidationRef.current = false
    })
  }, [runValidate])

  let statusNode: ReactNode = null
  if (result) {
    statusNode = (
      <div className="space-y-1.5 text-xs">
        {result.errors.map((msg) => (
          <p key={`e-${msg}`} className="text-red-600 dark:text-red-400">
            {msg}
          </p>
        ))}
        {result.warnings.map((msg) => (
          <p key={`w-${msg}`} className="text-amber-700 dark:text-amber-400">
            {msg}
          </p>
        ))}
        {result.ok && result.errors.length === 0 ? (
          <p className="text-emerald-700 dark:text-emerald-400">
            Specs válidas
            {result.warnings.length > 0 ? ' (com avisos).' : '.'}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Label htmlFor="lab_specs">Specs do lab (JSON: files + steps)</Label>
        <div
          className="flex flex-wrap gap-2"
          onPointerDown={markToolbarPointer}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleValidateClick}
          >
            Validar specs
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleInsertExample}
          >
            Inserir exemplo
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-ch-border bg-ch-surface">
        <LabSpecsCodemirror
          value={value}
          onChange={onChange}
          onBlur={handleEditorBlur}
        />
      </div>

      <p className="text-xs text-muted">
        Inclua <code>files</code>, <code>template</code> e <code>steps[]</code>{' '}
        com id, title, hint, expected e testFile/tests por passo. O{' '}
        <code>expected</code> é uma pergunta amigável exibida quando o aluno
        falha o Verificar. Em regex no <code>testFile</code>, escape as barras
        no JSON: <code>\\\\.</code> <code>\\\\s</code> <code>\\\\(</code>.
      </p>

      {statusNode}

      <div className="rounded-lg border border-ch-border">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium hover:bg-ch-muted/10"
          onClick={() => setPreviewOpen((o) => !o)}
          aria-expanded={previewOpen}
        >
          {previewOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-ch-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-ch-muted" />
          )}
          Ver como o aluno vê
        </button>
        {previewOpen ? (
          <div className="border-t border-ch-border p-3">
            <StudentPreview
              learnBody={learnBody}
              learnTitle={learnTitle}
              category={category}
              durationMinutes={durationMinutes}
              descriptionFallback={descriptionFallback}
              specsJson={value}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
})
