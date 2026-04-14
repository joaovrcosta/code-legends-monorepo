"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWelcomePaidStore } from "@/stores/welcome-paid-store";
import Image from "next/image";
import welcomePaidImage from "../../public/welcome-image-1.png";
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

export function WelcomePaidModal() {
  const isOpen = true
  const payload = { planSlug: "PRO", planName: "Premium", planImageUrl: 'https://raw.githubusercontent.com/joaovrcosta/code-icons/main/pro-icon.svg', subscriptionId: null, endsAt: null }
  const close = () => { }
  // const { isOpen, payload, close } = useWelcomePaidStore();

  const isDesktop = useIsDesktop();

  const title = "Bem-vindo!";
  const subtitle = payload
    ? `Seu acesso ${planLabel(payload.planSlug, payload.planName)} foi liberado.`
    : "Seu acesso foi liberado.";

  const Content = (
    <div className="relative">
      <button
        type="button"
        onClick={close}
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
              width={160}
              height={160}
              className="h-auto w-[160px] object-contain"
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
        <div className="mt-2 text-xs font-semibold tracking-widest text-[#00c8ff] uppercase">
          Bem vindo!
        </div>
        <div className="mt-2 text-2xl font-semibold text-white">{title}</div>
        <div className="mt-2 text-sm text-[#A1A1AA] leading-relaxed max-w-[42ch]">
          {subtitle}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={close}
            className="rounded-full bg-[#00c8ff] px-6 text-black hover:opacity-90"
          >
            Começar agora
          </Button>
          <Button
            onClick={close}
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
      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="bg-[#1A1A1E] border border-[#25252A] text-white p-0 max-w-[520px] sm:rounded-[28px] overflow-hidden">
          <DialogTitle className="sr-only">Boas-vindas</DialogTitle>
          {Content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()}>
      <DrawerContent className="bg-[#1A1A1E] border border-[#25252A] text-white p-0 rounded-t-[28px]">
        <DrawerTitle className="sr-only">Boas-vindas</DrawerTitle>
        {Content}
      </DrawerContent>
    </Drawer>
  );
}

