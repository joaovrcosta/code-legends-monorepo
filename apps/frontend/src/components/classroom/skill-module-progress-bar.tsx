'use client'

interface SkillModuleProgressBarProps {
  value: number
  className?: string
  /** Barra com gradiente vermelho → laranja → amarelo (flame) */
  flameGradient?: boolean
}

const flameBarClass =
  'bg-[linear-gradient(90deg,#ef4444_0%,#f97316_50%,#eab308_100%)] shadow-[0_0_14px_rgba(249,115,22,0.5)]'

export function SkillModuleProgressBar({
  value,
  className,
  flameGradient = false,
}: SkillModuleProgressBarProps) {
  const progress = Math.min(Math.max(value, 0), 100)

  return (
    <div className={`relative w-full ${className || ''}`}>
      <div className="relative h-[18px] w-full rounded-full bg-[#25252A] overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${
            flameGradient
              ? flameBarClass
              : 'bg-blue-gradient-500 shadow-[0_0_14px_#00C8FF]'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

