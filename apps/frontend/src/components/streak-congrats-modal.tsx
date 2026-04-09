"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame } from "@phosphor-icons/react/dist/ssr";
import { useStreakCongratsStore } from "@/stores/streak-congrats-store";

export function StreakCongratsModal() {
  const { isOpen, payload, close } = useStreakCongratsStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="bg-[#111114] border border-[#25252A] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame size={22} weight="fill" className="text-[#FF6200]" />
            Parabéns!
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-[#C4C4CC] leading-relaxed">
          Você aumentou sua ofensiva. Continue mantendo a sequência diária.
        </div>

        {payload && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[16px] border border-[#25252A] bg-[#141417] p-4">
              <div className="text-[11px] uppercase tracking-widest text-[#7e7e89] font-semibold">
                Streak atual
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums">
                {payload.current}
              </div>
            </div>
            <div className="rounded-[16px] border border-[#25252A] bg-[#141417] p-4">
              <div className="text-[11px] uppercase tracking-widest text-[#7e7e89] font-semibold">
                Melhor streak
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums">
                {payload.best}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button onClick={close} className="rounded-full px-5">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

