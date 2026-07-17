'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { CaretDown, CheckSquare, Square } from '@phosphor-icons/react'
import type { LabStep } from '@/types/roadmap'

type LabInstructionsPanelProps = {
  steps: LabStep[]
  currentStepId: string | undefined
  completedStepIds: string[]
}

export function LabInstructionsPanel({
  steps,
  currentStepId,
  completedStepIds,
  alreadyDone = false,
}: LabInstructionsPanelProps & { alreadyDone?: boolean }) {
  const [hintOpenFor, setHintOpenFor] = useState<string | null>(null)

  return (
    <section className="space-y-3 border-t border-[#25252A] pt-5">
      <div className="flex items-center gap-2 px-4">
        <CheckSquare className="h-4 w-4 text-white/80" weight="bold" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
          Instructions
        </h3>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const done = completedStepIds.includes(step.id)
          const active = step.id === currentStepId && !done
          const locked = !done && !active
          const hintOpen = hintOpenFor === step.id

          return (
            <li
              key={step.id}
              className={`px-3 py-8 transition ${active
                ? 'border-white/25 bg-white/5 text-white'
                : locked
                  ? 'border-transparent text-white/35'
                  : ' bg-emerald-500/5 text-white/80'
                }`}
            >
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0">
                  {done ? (
                    <CheckSquare
                      className="h-5 w-5 text-[#278b4d]"
                      weight="fill"
                    />
                  ) : (
                    <Square
                      className={`h-5 w-5 ${active ? 'text-white' : 'text-white/30'}`}
                    />
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold tabular-nums">
                      {index + 1}.
                    </span>
                    <div
                      className={`prose prose-invert prose-sm max-w-none prose-p:my-0 prose-code:text-[#86efac] prose-code:bg-transparent prose-code:px-0 prose-code:before:content-none prose-code:after:content-none ${locked ? 'opacity-60' : ''
                        }`}
                    >
                      <ReactMarkdown>{step.title}</ReactMarkdown>
                    </div>
                  </div>

                  {active && step.hint ? (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setHintOpenFor(hintOpen ? null : step.id)
                        }
                        className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white"
                      >
                        Stuck? Get a hint
                        <CaretDown
                          className={`h-3 w-3 transition ${hintOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {hintOpen ? (
                        <p className="mt-2 rounded-md bg-black/30 px-3 py-2 text-xs text-white/75">
                          {step.hint}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
