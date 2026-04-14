"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWelcomePaidStore } from "@/stores/welcome-paid-store";
import { ackPostPurchaseWelcome } from "@/actions/account/post-purchase-welcome";
import Image from "next/image";
import codeLegendsLogo from "../../public/logo-mobile.png";

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

function planLabel(slug: string | null, name: string | null) {
  if (name) return name;
  if (!slug) return "assinatura";
  if (slug === "PRO") return "PRO";
  if (slug === "PREMIUM") return "PREMIUM";
  return slug;
}

function planColorHex(slug: string | null): string {
  const s = (slug ?? "").toLowerCase();
  if (s === "pro") return "#8234E9";
  if (s === "premium") return "#FF6200";
  if (s === "free") return "#B8E62E";
  return "#00c8ff";
}

function readableTextColor(backgroundHex: string): "#000000" | "#FFFFFF" {
  const hex = backgroundHex.replace("#", "").trim();
  if (hex.length !== 6) return "#FFFFFF";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#000000" : "#FFFFFF";
}

export function WelcomePaidModal() {
  const { isOpen, payload } = useWelcomePaidStore();

  const isDesktop = useIsDesktop();
  const accentHex =
    payload?.planColorHex?.trim() ||
    planColorHex(payload?.planSlug ?? null);
  const accentText = readableTextColor(accentHex);

  const title = "Bem-vindo!";
  const subtitle =
    payload?.welcomeSubtitle?.trim() ||
    (payload
      ? `Seu acesso ${planLabel(payload.planSlug, payload.planName)} foi liberado.`
      : "Seu acesso foi liberado.");

  const ackAndClose = async () => {
    const p = useWelcomePaidStore.getState().payload;
    const pid = p?.paymentId;
    if (pid) {
      await ackPostPurchaseWelcome(pid).catch(() => {});
    }
    useWelcomePaidStore.getState().close();
  };

  const Content = (
    <div className="relative">
      <button
        type="button"
        onClick={() => void ackAndClose()}
        aria-label="Fechar"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-[#25252A] bg-[#28282C] text-[#C4C4CC] hover:bg-[#1b1b1f]"
      >
        <X size={20} className="text-white" />
      </button>

      <div className="px-6 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-9 flex flex-col items-center justify-center text-center">
        <div>
          {payload?.planImageUrl ? (
            <Image
              src={payload.planImageUrl}
              alt={payload.planName ?? payload.planSlug ?? "Plano"}
              width={120}
              height={20}
              className="h-48 w-[160px] object-contain"
            />
          ) : (
            <Image
              src={codeLegendsLogo}
              alt="Code Legends"
              width={200}
              height={200}
            />
          )}
        </div>
        <div
          className="mt-2 text-xs font-semibold tracking-widest uppercase"
          style={{ color: accentHex }}
        >
          Bem vindo!
        </div>
        <div className="mt-2 text-2xl font-semibold text-white">{title}</div>
        <div className="mt-2 text-sm text-[#A1A1AA] leading-relaxed max-w-[42ch]">
          {subtitle}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={() => void ackAndClose()}
            className="rounded-full px-6 hover:opacity-90"
            style={{ backgroundColor: accentHex, color: accentText }}
          >
            Começar agora
          </Button>
          <Button
            onClick={() => void ackAndClose()}
            variant="outline"
            className="rounded-full border-[#25252A] bg-transparent text-white hover:bg-[#25252A]"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && void ackAndClose()}>
        <DialogContent className="bg-[#1A1A1E] border border-[#25252A] text-white p-0 max-w-[520px] sm:rounded-[28px] overflow-hidden">
          <DialogTitle className="sr-only">Boas-vindas</DialogTitle>
          {Content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && void ackAndClose()}>
      <DrawerContent className="bg-[#1A1A1E] border border-[#25252A] text-white p-0 rounded-t-[28px]">
        <DrawerTitle className="sr-only">Boas-vindas</DrawerTitle>
        {Content}
      </DrawerContent>
    </Drawer>
  );
}

