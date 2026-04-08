'use client'

import { useCallback } from 'react'
import CountUp from 'react-countup'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  formatNumberCompact,
  getCompactNumberDisplay,
} from '@/lib/format-number'
import { cn } from '@/lib/utils'

const flameGradientClass =
  'bg-[linear-gradient(90deg,#ef4444_0%,#f97316_50%,#eab308_100%)] bg-clip-text text-transparent'

type CompactNumberProps = {
  value: number
  className?: string
  suffix?: string
  tooltipOnlyWhenCompact?: boolean
  enableCountUp?: boolean
  flameGradient?: boolean
}

export function CompactNumber({
  value,
  className,
  suffix = '',
  tooltipOnlyWhenCompact = true,
  enableCountUp = false,
  flameGradient = false,
}: CompactNumberProps) {
  const { full } = getCompactNumberDisplay(value)
  const showTooltip = !tooltipOnlyWhenCompact || value >= 1000
  const formattingFn = useCallback((v: number) => formatNumberCompact(v), [])
  const textClass = flameGradient ? flameGradientClass : ''

  const content = enableCountUp ? (
    <span className={cn(textClass, className)}>
      <CountUp
        start={0}
        end={value}
        duration={3}
        decimals={0}
        enableScrollSpy={false}
        formattingFn={formattingFn}
        className="inline"
      />
      {suffix}
    </span>
  ) : (
    <span className={cn(textClass, className)}>
      {formatNumberCompact(value)}
      {suffix}
    </span>
  )

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{content}</span>
        </TooltipTrigger>
        <TooltipContent>
          {full}
          {suffix}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
