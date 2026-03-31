"use client"

import { Check } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type CompleteLessonButtonVariant = "learn" | "classroom"

export function CompleteLessonButton({
  isMarked,
  isMarking,
  disabled,
  onClick,
  as = "button",
  variant = "classroom",
  markLabel,
  markedLabel,
  markingLabel = "Marcando...",
  className,
  iconSize = 20,
}: {
  isMarked: boolean
  isMarking: boolean
  disabled?: boolean
  onClick: () => void
  as?: "button" | "div"
  variant?: CompleteLessonButtonVariant
  markLabel?: string
  markedLabel?: string
  markingLabel?: string
  className?: string
  iconSize?: number
}) {
  const resolvedMarkLabel =
    markLabel ?? (variant === "learn" ? "Completar lição" : "Marcar como concluído")
  const resolvedMarkedLabel =
    markedLabel ?? (variant === "learn" ? "Concluído" : "Concluído")

  const baseClassName = cn(
    "gap-2 rounded-full px-6",
    variant === "learn"
      ? "flex items-center justify-center w-full lg:w-fit border px-5 py-2.5 text-sm font-semibold transition-all"
      : "h-[42px]",
    isMarked
      ? "bg-[#00b3e4]/20 text-[#00b3e4] border border-[#00b3e4] hover:bg-[#00b3e4]/20"
      : variant === "learn"
        ? "border-[#25252A] text-white hover:border-[#00b3e4] bg-white/5 border"
        : "bg-[#25252A] text-white border border-[#25252A] hover:border-[#00b3e4] hover:bg-[#25252A]",
    className,
  )

  const content = (
    <>
      <Check weight="bold" size={iconSize} />
      {isMarking ? markingLabel : isMarked ? resolvedMarkedLabel : resolvedMarkLabel}
    </>
  )

  if (as === "div") {
    const isDisabled = Boolean(disabled)
    return (
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        className={cn(
          baseClassName,
          "select-none",
          isDisabled && "opacity-50 cursor-not-allowed",
        )}
        onClick={() => {
          if (isDisabled) return
          onClick()
        }}
        onKeyDown={(e) => {
          if (isDisabled) return
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {content}
      </div>
    )
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={baseClassName}
    >
      {content}
    </Button>
  )
}

