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

type CompactNumberProps = {
  value: number
  className?: string
  suffix?: string
  tooltipOnlyWhenCompact?: boolean
  enableCountUp?: boolean
}

export function CompactNumber({
  value,
  className,
  suffix = '',
  tooltipOnlyWhenCompact = true,
  enableCountUp = false,
}: CompactNumberProps) {
  const { full } = getCompactNumberDisplay(value)
  const showTooltip = !tooltipOnlyWhenCompact || value >= 1000
  const formattingFn = useCallback((v: number) => formatNumberCompact(v), [])

  const content = enableCountUp ? (
    <CountUp
      start={0}
      end={value}
      duration={3}
      decimals={0}
      enableScrollSpy={false}
      formattingFn={formattingFn}
      suffix={suffix}
      className={cn(className)}
    />
  ) : (
    <span className={cn(className)}>
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
