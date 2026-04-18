"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Lightning, X } from "@phosphor-icons/react/dist/ssr";
import { useStreakCongratsStore } from "@/stores/streak-congrats-store";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

const BOX_STAGGER_MS = 480;
const BOX_INITIAL_DELAY_MS = 220;
const BOX_TRANSITION_CLASS = "duration-700";
const COUNT_UP_DURATION = 2;
const BOX_TRANSITION_MS = 700;
const AFTER_BOXES_BEFORE_BAR_MS = 120;
const BAR_FILL_MS = 1100;
const AFTER_BAR_BEFORE_LIGHTNING_MS = 80;

type StreakStatNumberProps = {
  end: number;
  active: boolean;
  reduceMotion: boolean;
  instanceKey: string;
};

function StreakStatNumber({
  end,
  active,
  reduceMotion,
  instanceKey,
}: StreakStatNumberProps) {
  if (!active) {
    return (
      <span className="tabular-nums opacity-0" aria-hidden>
        0
      </span>
    );
  }
  if (reduceMotion) {
    return <span className="tabular-nums">{end}</span>;
  }
  return (
    <CountUp
      key={instanceKey}
      className="tabular-nums"
      start={0}
      end={end}
      duration={COUNT_UP_DURATION}
      preserveValue
      useEasing
      decimals={0}
    />
  );
}

export function StreakCongratsModal() {
  const { isOpen, payload, close } = useStreakCongratsStore();
  const isDesktop = useIsDesktop();
  const [boxesRevealed, setBoxesRevealed] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [barFilledPercent, setBarFilledPercent] = useState(0);
  const [todayLightningVisible, setTodayLightningVisible] = useState(false);
  const todayIdx = weekdayIdxInSaoPaulo(new Date());
  const weeklyLabels = ["D", "S", "T", "Q", "Q", "S", "S"] as const;
  const weekProgressTarget = Math.round((1 / 7) * 100);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isOpen || !payload) {
      setBoxesRevealed(0);
      setBarFilledPercent(0);
      setTodayLightningVisible(false);
      return;
    }

    if (reduceMotion) {
      setBoxesRevealed(3);
      setBarFilledPercent(weekProgressTarget);
      setTodayLightningVisible(true);
      return;
    }

    setBoxesRevealed(0);
    setBarFilledPercent(0);
    setTodayLightningVisible(false);

    const t0 = window.setTimeout(() => setBoxesRevealed(1), BOX_INITIAL_DELAY_MS);
    const t1 = window.setTimeout(
      () => setBoxesRevealed(2),
      BOX_INITIAL_DELAY_MS + BOX_STAGGER_MS,
    );
    const t2 = window.setTimeout(
      () => setBoxesRevealed(3),
      BOX_INITIAL_DELAY_MS + BOX_STAGGER_MS * 2,
    );

    const thirdBoxAt = BOX_INITIAL_DELAY_MS + BOX_STAGGER_MS * 2;
    const barStartAt =
      thirdBoxAt + BOX_TRANSITION_MS + AFTER_BOXES_BEFORE_BAR_MS;

    const tBar = window.setTimeout(() => {
      requestAnimationFrame(() => {
        setBarFilledPercent(weekProgressTarget);
      });
    }, barStartAt);

    const tLightning = window.setTimeout(() => {
      setTodayLightningVisible(true);
    }, barStartAt + BAR_FILL_MS + AFTER_BAR_BEFORE_LIGHTNING_MS);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tBar);
      window.clearTimeout(tLightning);
    };
  }, [isOpen, payload, reduceMotion]);

  const boxAnimClass = (index: 0 | 1 | 2) =>
    cn(
      "flex flex-col items-center justify-center border border-[#25252A] rounded-[20px] p-4 min-w-0 transition-all ease-out motion-reduce:transition-none",
      BOX_TRANSITION_CLASS,
      index === 0 && "bg-[#25252A]",
      boxesRevealed > index
        ? "opacity-100 translate-y-0 scale-100"
        : "opacity-0 translate-y-3 scale-95 pointer-events-none",
      "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100",
    );

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
        <Lightning
          size={120}
          weight="fill"
          className="text-lime-300 drop-shadow-[0_0_32px_rgba(163,230,53,0.55)]"
        />

        <div className="mt-4 text-2xl text-[#C4C4CC] leading-relaxed">
          <h3>Sequência estendida!</h3>
        </div>
      </div>

      {payload && (
        <div className="grid grid-cols-3 gap-3 mt-4 w-full">
          <div className={boxAnimClass(0)}>
            <h3 className="text-2xl font-bold text-white tabular-nums m-0 min-h-[2rem] flex items-center justify-center">
              <StreakStatNumber
                end={payload.current}
                active={boxesRevealed > 0}
                reduceMotion={reduceMotion}
                instanceKey={`streak-c-${isOpen}-${payload.current}-${payload.best}-${payload.totalActiveDays}`}
              />
            </h3>
            <p className="text-[11px] text-[#C4C4CC] text-center">Streak atual</p>
          </div>
          <div className={boxAnimClass(1)}>
            <h3 className="text-2xl font-bold text-white tabular-nums m-0 min-h-[2rem] flex items-center justify-center">
              <StreakStatNumber
                end={payload.best}
                active={boxesRevealed > 1}
                reduceMotion={reduceMotion}
                instanceKey={`streak-b-${isOpen}-${payload.current}-${payload.best}-${payload.totalActiveDays}`}
              />
            </h3>
            <p className="text-[11px] text-[#C4C4CC] text-center whitespace-nowrap">
              Melhor streak
            </p>
          </div>
          <div className={boxAnimClass(2)}>
            <h3 className="text-2xl font-bold text-white tabular-nums m-0 min-h-[2rem] flex items-center justify-center">
              <StreakStatNumber
                end={payload.totalActiveDays}
                active={boxesRevealed > 2}
                reduceMotion={reduceMotion}
                instanceKey={`streak-t-${isOpen}-${payload.current}-${payload.best}-${payload.totalActiveDays}`}
              />
            </h3>
            <p className="text-[11px] text-[#C4C4CC] text-center">Total de dias</p>
          </div>
        </div>
      )}

      <div className="mt-6 mb-6 bg-[#25252A]/30 rounded-[20px] p-4">
        <div className="flex items-center justify-between mb-6">
          {weeklyLabels.map((label, idx) => {
            const isToday = idx === todayIdx;
            const showLightning = isToday && todayLightningVisible;
            const isActiveCircle = showLightning;
            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-xs text-[#C4C4CC] mb-2">{label}</span>
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center motion-reduce:transition-none",
                    !showLightning &&
                      "transition-all duration-300 ease-out",
                    isActiveCircle ? "bg-lime-streak" : "bg-[#25252A]",
                    showLightning && "animate-streak-bolinha-kick origin-center",
                  )}
                >
                  {showLightning ? (
                    <Lightning
                      size={20}
                      weight="fill"
                      className="text-[#0f1408] animate-lightning-electric motion-reduce:animate-none"
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative h-4 bg-[#25252A] rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute left-0 top-0 h-full rounded-full bg-lime-streak-bar motion-reduce:transition-none",
              reduceMotion ? "" : "transition-[width] ease-out",
            )}
            style={{
              width: `${barFilledPercent}%`,
              ...(reduceMotion
                ? {}
                : { transitionDuration: `${BAR_FILL_MS}ms` }),
            }}
          />
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="bg-surface-2 border border-[#25252A] text-white p-0 max-w-[520px] sm:rounded-[28px]">
          <DialogTitle className="sr-only">Parabéns</DialogTitle>
          {Content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()}>
      <DrawerContent className="bg-surface-2 border border-[#25252A] text-white p-0 rounded-t-[28px]">
        <DrawerTitle className="sr-only">Parabéns</DrawerTitle>
        {Content}
      </DrawerContent>
    </Drawer>
  );
}

