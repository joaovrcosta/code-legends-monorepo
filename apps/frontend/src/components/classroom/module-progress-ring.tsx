'use client'

import { Check } from '@phosphor-icons/react/dist/ssr'
import { memo } from 'react'

interface ProgressRingProps {
  progress: number
  moduleNumber: number
  size?: number
  strokeWidth?: number
  progressColor?: string
  trackColor?: string
  isCurrent?: boolean
  /** Se true, exibe "01", "02"…; se false, "1", "2"… */
  padModuleNumber?: boolean
  /** Texto opcional no centro (ex.: "42%"). Se definido, substitui número/check. */
  centerLabel?: string
}

const DEFAULT_SIZE = 42
const DEFAULT_STROKE = 2

export const ProgressRing = memo(function ModuleProgressRing({
  progress,
  moduleNumber,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  progressColor = 'stroke-cyan-400',
  trackColor = 'stroke-zinc-700',
  isCurrent = false,
  padModuleNumber = true,
  centerLabel,
}: ProgressRingProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const isComplete = clampedProgress >= 1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - clampedProgress * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {/* Fundo do anel */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
        {/* Arco de progresso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-[stroke-dashoffset] duration-300 ${progressColor}`}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        {centerLabel != null ? (
          <span className="text-xs font-bold tabular-nums text-zinc-200">
            {centerLabel}
          </span>
        ) : isComplete ? (
          <Check
            size={20}
            className="text-cyan-400 animate-check-in origin-center"
            weight="bold"
          />
        ) : (
          <span
            className={`text-sm font-bold tabular-nums ${isCurrent ? 'text-cyan-400' : 'text-zinc-300'
              }`}
          >
            {padModuleNumber
              ? String(moduleNumber).padStart(2, '0')
              : String(moduleNumber)}
          </span>
        )}
      </div>
    </div>
  )
})
