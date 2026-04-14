"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Flame, X } from "@phosphor-icons/react/dist/ssr";
import { useStreakCongratsStore } from "@/stores/streak-congrats-store";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const SAO_PAULO_TZ = "America/Sao_Paulo";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return isDesktop;
}

function weekdayIdxInSaoPaulo(date: Date) {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: SAO_PAULO_TZ,
    weekday: "short",
  })
    .formatToParts(date)
    .find((p) => p.type === "weekday")?.value;

  const toIdx: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return wd != null ? toIdx[wd] : 0;
}

export function StreakCongratsModal() {
  const { isOpen, payload, close } = useStreakCongratsStore();
  const isDesktop = useIsDesktop();
  const todayIdx = weekdayIdxInSaoPaulo(new Date());
  const weeklyLabels = ["D", "S", "T", "Q", "Q", "S", "S"] as const;
  const percent = Math.round((1 / 7) * 100);

  const Content = (
    <div className="relative px-6 pt-6 pb-6">
      <button
        type="button"
        onClick={close}
        aria-label="Fechar"
        className="absolute lg:right-4 right-3 lg:top-4 top-[-12px] grid h-9 w-9 place-items-center rounded-full border border-[#25252A] bg-[#28282C] text-[#C4C4CC] hover:bg-[#1b1b1f]"
      >
        <X size={20} className="text-white" />
      </button>

      <div className="flex flex-col items-center text-center">
        <Flame size={120} weight="fill" className="text-[#FFBF00]" />

        <div className="mt-4 text-2xl text-[#C4C4CC] leading-relaxed">
          <h3>Parabéns!</h3>
          <p className="text-sm text-[#8d8d8d] leading-relaxed">
            Você aumentou sua ofensiva. Continue mantendo a sequência diária.
          </p>
        </div>
      </div>

      {payload && (
        <div className="grid grid-cols-3 gap-3 mt-4 w-full">
          <div className="flex flex-col bg-[#25252A] items-center justify-center border border-[#25252A] rounded-[20px] p-4 min-w-0">
            <h3 className="text-2xl font-bold text-white">{payload.current}</h3>
            <p className="text-[11px] text-[#C4C4CC] text-center">Streak atual</p>
          </div>
          <div className="flex flex-col items-center justify-center border border-[#25252A] rounded-[20px] p-4 min-w-0">
            <h3 className="text-2xl font-bold text-white">{payload.best}</h3>
            <p className="text-[11px] text-[#C4C4CC] text-center whitespace-nowrap">
              Melhor streak
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border border-[#25252A] rounded-[20px] p-4 min-w-0">
            <h3 className="text-2xl font-bold text-white">{payload.totalActiveDays}</h3>
            <p className="text-[11px] text-[#C4C4CC] text-center">Total de dias</p>
          </div>
        </div>
      )}

      <div className="mt-6 mb-6 bg-[#25252A]/30 rounded-[20px] p-4">
        <div className="flex items-center justify-between mb-6">
          {weeklyLabels.map((label, idx) => {
            const isToday = idx === todayIdx;
            const isActive = isToday;
            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-xs text-[#C4C4CC] mb-2">{label}</span>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-yellow-lightning-600" : "bg-[#25252A]"
                    }`}
                >
                  {isToday ? (
                    <Flame size={20} weight="fill" className="text-white" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative h-4 bg-[#25252A] rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-yellow-lightning-600 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="bg-[#1A1A1E] border border-[#25252A] text-white p-0 max-w-[520px] sm:rounded-[28px]">
          <DialogTitle className="sr-only">Parabéns</DialogTitle>
          {Content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()}>
      <DrawerContent className="bg-[#1A1A1E] border border-[#25252A] text-white p-0 rounded-t-[28px]">
        <DrawerTitle className="sr-only">Parabéns</DrawerTitle>
        {Content}
      </DrawerContent>
    </Drawer>
  );
}

