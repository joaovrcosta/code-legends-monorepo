"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type CareerLockedPadlockPillProps = {
  title: string;
  "aria-label": string;
  className?: string;
};

/** Pílula com cadeado — alinhada ao estado bloqueado do painel de certificado (toque = shake). */
export function CareerLockedPadlockPill({
  title,
  "aria-label": ariaLabel,
  className,
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
        "flex h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#2E2E32] bg-[#18181f] px-4 outline-none transition-colors hover:bg-[#323232] focus-visible:ring-2 focus-visible:ring-[#00C8FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D12] sm:min-w-[10rem] sm:w-auto",
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
