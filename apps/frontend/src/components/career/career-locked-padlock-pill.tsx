"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type CareerLockedPadlockPillProps = {
  title: string;
  "aria-label": string;
  className?: string;
  /** `circle` = 40×40 (lista de unidades); `pill` = largura expandida (exames). */
  variant?: "circle" | "pill";
};

/** Botão de bloqueio com cadeado — toque = shake. */
export function CareerLockedPadlockPill({
  title,
  "aria-label": ariaLabel,
  className,
  variant = "circle",
}: CareerLockedPadlockPillProps) {
  const [pulse, setPulse] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setPulse(true);
    timeoutRef.current = setTimeout(() => {
      setPulse(false);
      timeoutRef.current = null;
    }, 480);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={play}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#00C8FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D12]",
        variant === "circle"
          ? "h-10 w-10 bg-[#25252A] hover:bg-[#2E2E32]"
          : "h-10 w-full border border-[#2E2E32] bg-[#18181f] px-4 hover:bg-[#323232] sm:min-w-[10rem] sm:w-auto",
        pulse && "animate-locked-shake",
        className,
      )}
    >
      <Lock
        size={20}
        weight="fill"
        className={cn(
          "shrink-0 text-white/90",
          pulse && "animate-locked-latch",
        )}
        aria-hidden
      />
    </button>
  );
}
