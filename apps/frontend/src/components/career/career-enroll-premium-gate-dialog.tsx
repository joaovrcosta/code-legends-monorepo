"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CtaAssinarCursoButton } from "@/components/cta";
import type { CareerEnrollBlockedPlan } from "@/lib/career-enroll-gate";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: CareerEnrollBlockedPlan | null;
};

export function CareerEnrollPremiumGateDialog({
  open,
  onOpenChange,
  variant,
}: Props) {
  const isPro = variant === "PRO";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-[#25252A] bg-[#0C0C0F] p-6 text-white sm:rounded-[20px]">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold text-white">
            {isPro
              ? "Upgrade para Premium"
              : "Assine para acessar carreiras"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-white/70">
          {isPro
            ? "As trilhas de carreira são exclusivas do plano Premium. Faça upgrade para se inscrever e acompanhar módulos, exames e certificado."
            : "As trilhas de carreira estão disponíveis no plano Premium. Assine para desbloquear inscrição, progresso e certificação."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#25252A] bg-white/5 h-[44px] text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          {isPro ? (
            <CtaAssinarCursoButton
              planSlug="premium"
              showArrow
              className="[&_button]:h-[44px] [&_button]:rounded-full"
            >
              Ir para Premium
            </CtaAssinarCursoButton>
          ) : (
            <Button
              asChild
              className="rounded-full bg-blue-gradient-500 h-[44px] font-semibold text-white hover:opacity-90"
            >
              <Link href="/plans">Ver planos</Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
