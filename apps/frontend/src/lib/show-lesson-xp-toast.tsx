"use client";

import Image from "next/image";
import type { ContinueCourseResult } from "@/actions/course";
import { CompactNumber } from "@/components/ui/compact-number";
import { dismiss, toast } from "@/components/ui/use-toast";

export function showLessonXpToast(result: ContinueCourseResult) {
  if (!result?.success) return;
  const xp = result.xpGained;
  if (typeof xp !== "number" || xp <= 0) return;

  const id = `xp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  toast({
    id,
    duration: 2800,
    className: "border-0 bg-transparent p-0 shadow-none",
    description: (
      <div
        className="relative w-[min(92vw,420px)] overflow-hidden rounded-[18px] border border-[#25252A] bg-[#121214] px-5 py-4 text-white shadow-[0_14px_50px_rgba(0,0,0,0.55)]"
        role="status"
        aria-live="polite"
      >
        {/* Barra de progresso superior */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#ef4444_0%,#f97316_50%,#eab308_100%)]" />

        <div className="flex items-center gap-4">
          {/* Ícone centralizado verticalmente */}
          <div className="flex-shrink-0">
            <Image
              src="/xp-icon.svg"
              alt="XP"
              width={16}
              height={24}
              className="object-contain"
            />
          </div>

          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[15px] font-bold tracking-tight">
              Você ganhou{" "}
              <span className="whitespace-nowrap text-orange-500">
                +<CompactNumber value={xp} flameGradient enableCountUp /> XP
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[#C4C4CC] font-medium">
              Continue acumulando para subir de nível.
            </p>
          </div>

          {/* Botão de fechar centralizado */}
          <button
            type="button"
            onClick={() => dismiss(id)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#7C7C8A] transition-colors hover:bg-[#202024] hover:text-white"
            aria-label="Fechar"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
      </div>
    ),
  });
}