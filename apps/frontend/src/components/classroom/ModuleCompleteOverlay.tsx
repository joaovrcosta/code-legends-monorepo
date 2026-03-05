'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkillProgressPanel } from '@/components/classroom/SkillProgressPanel'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'

interface ModuleCompleteOverlayProps {
  onContinue: () => void
}

export function ModuleCompleteOverlay({ onContinue }: ModuleCompleteOverlayProps) {
  const { activeCourse } = useActiveCourseStore()
  const { lastModuleCompletion, setLastModuleCompletion } = useCourseModalStore()

  if (!lastModuleCompletion?.moduleCompleted) {
    return null
  }

  const { moduleTitle, progress, xpGained } = lastModuleCompletion

  const handleContinue = () => {
    setLastModuleCompletion(null)
    onContinue()
  }

  const safeProgress =
    typeof progress === 'number' && !Number.isNaN(progress)
      ? Math.max(0, Math.min(100, progress))
      : undefined

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl rounded-[24px] border border-white/10 bg-[#050509]/95 px-6 py-6 shadow-[0_0_40px_rgba(0,200,255,0.25)]">
        <button
          type="button"
          onClick={handleContinue}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="pt-4 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
              Módulo concluído
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {moduleTitle || 'Você finalizou este módulo!'}
            </h2>
          </div>

          <div className="rounded-[16px] border border-[#1f2933] bg-[#05060a] px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">XP ganho neste módulo</p>
                <p className="text-3xl font-bold text-[#7dd3fc]">
                  +{xpGained ?? 0}{' '}
                  <span className="text-sm font-medium text-zinc-400">XP</span>
                </p>
              </div>
              {typeof safeProgress === 'number' && (
                <div className="w-40">
                  <p className="text-xs text-zinc-400 mb-1">Progresso do módulo</p>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#22c55e] via-[#22d3ee] to-[#0ea5e9]"
                      style={{ width: `${safeProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{safeProgress}%</p>
                </div>
              )}
            </div>
          </div>

          {activeCourse?.id && (
            <div className="mt-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
                Sua evolução nas skills deste curso
              </p>
              <SkillProgressPanel courseId={activeCourse.id} />
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={handleContinue}
              className="rounded-full bg-blue-gradient-500 px-6 text-sm font-semibold text-black hover:opacity-90"
            >
              Continuar para o próximo módulo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

