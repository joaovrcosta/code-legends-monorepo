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
        {/* Camada externa: só anima width (ganho de XP fluido) */}
        <div
          className="absolute left-0 top-0 h-full overflow-hidden rounded-full transition-module-progress-width"
          style={{ width: `${progress}%` }}
        >
          <div
            className={`relative flex h-full w-full min-w-0 items-center justify-end overflow-hidden rounded-full bg-blue-gradient-500 pl-2 shadow-[0_0_12px_rgba(0,200,255,0.35)] ${
              showTrophy && progress === 100 ? "pr-5" : "pr-2"
            }`}
          >
            {progress > 0 && (
              <span
                className={`text-right text-[12px] font-semibold tabular-nums text-white/90 ${
                  progress <= 15 ? "hidden lg:block" : ""
                }`}
              >
                <CountUp
                  key={roundedProgress}
                  end={roundedProgress}
                  duration={0.9}
                  decimals={0}
                  suffix="%"
                  enableScrollSpy={false}
                />
              </span>
            )}
          </div>
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
