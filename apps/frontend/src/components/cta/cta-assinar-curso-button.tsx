"use client";

import Link from "next/link";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

type PlanoSlug = "pro" | "premium";

export interface CtaAssinarCursoButtonProps {
  /** Plano do carrinho: "pro" ou "premium". Default: "pro" */
  planSlug?: PlanoSlug;
  /** Texto do botão */
  children?: React.ReactNode;
  /** Mostrar ícone de seta */
  showArrow?: boolean;
  className?: string;
}

const DEFAULT_LABEL = "Assinar o curso";

export function CtaAssinarCursoButton({
  planSlug = "pro",
  children = DEFAULT_LABEL,
  showArrow = true,
  className,
}: CtaAssinarCursoButtonProps) {
  const href = `/cart/${planSlug}`;

  return (
    <Link href={href} className={cn("block w-full sm:w-auto", className)}>
      <PrimaryButton
        variant="callToAction"
        className={cn(
          "gap-2 w-full sm:w-auto",
          planSlug === "premium" &&
            "!bg-premium-gradient border-white/25 text-white shadow-[0_0_20px_rgba(245,180,200,0.15)] hover:opacity-90",
        )}
      >
        {children}
        {showArrow && <ArrowUpRight size={18} weight="bold" />}
      </PrimaryButton>
    </Link>
  );
}
