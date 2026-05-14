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
  /** Texto opcional no centro (ex.: "42%"). Em 100% mostra check no lugar do texto. */
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
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
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        {isComplete ? (
          <Check
            size={Math.max(18, Math.round(size * 0.55))}
            className="text-cyan-400 animate-check-in origin-center"
            weight="bold"
          />
        ) : centerLabel != null ? (
          <span className="text-xs font-bold tabular-nums text-zinc-200">
            {centerLabel}
          </span>
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
