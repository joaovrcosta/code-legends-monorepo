"use client";

import { Trophy } from "@phosphor-icons/react/dist/ssr";
import CountUp from "react-countup";

interface ModuleProgressBarProps {
  value: number;
  className?: string;
  showTrophy?: boolean;
}

export function ModuleProgressBar({
  value,
  className,
  showTrophy = true,
}: ModuleProgressBarProps) {
  const progress = Math.min(Math.max(value, 0), 100);
  const roundedProgress = Math.round(progress);

  return (
    <div className={`relative w-full ${className || ""}`}>
      {/* Barra de progresso */}
      <div className="relative h-[18px] w-full rounded-full bg-[#25252A] overflow-hidden">
        {/* Seção preenchida (azul - gradiente do site) */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-blue-gradient-500 flex items-center justify-end pr-2 transition-all duration-300 shadow-[0_0_14px_#00C8FF]"
          style={{ width: `${progress}%` }}
        >
          {/* Texto do percentual dentro da barra azul */}
          {/* Desktop: mostra sempre que progress > 0 */}
          {/* Mobile: mostra apenas quando progress > 15 */}
          {progress > 0 && (
            <span
              className={`text-[12px] font-semibold text-white/90 ${
                !showTrophy ? "mr-1" : progress === 100 ? "mr-5" : "mr-1"
              } ${progress <= 15 ? "hidden lg:block" : ""}`}
            >
              <CountUp
                key={roundedProgress}
                end={roundedProgress}
                duration={1}
                decimals={0}
                suffix="%"
                enableScrollSpy={false}
              />
            </span>
          )}
        </div>
      </div>

      {/* Ícone de troféu à direita */}
      {showTrophy && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
          <Trophy
            size={32}
            weight={progress === 100 ? "fill" : "fill"}
            className={progress === 100 ? "text-[#00c7fe]" : "text-[#484850]"}
          />
        </div>
      )}
    </div>
  );
}
