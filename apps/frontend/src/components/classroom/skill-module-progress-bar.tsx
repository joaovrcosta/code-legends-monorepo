'use client'

interface SkillModuleProgressBarProps {
  value: number
  className?: string
}

export function SkillModuleProgressBar({
  value,
  className,
}: SkillModuleProgressBarProps) {
  const progress = Math.min(Math.max(value, 0), 100)

  return (
    <div className={`relative w-full ${className || ''}`}>
      <div className="relative h-[18px] w-full rounded-full bg-[#25252A] overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-blue-gradient-500 transition-all duration-300 shadow-[0_0_14px_#00C8FF]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

