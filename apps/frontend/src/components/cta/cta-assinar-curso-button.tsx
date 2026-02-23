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
      <PrimaryButton variant="callToAction" className="gap-2 w-full sm:w-auto">
        {children}
        {showArrow && <ArrowUpRight size={18} weight="bold" />}
      </PrimaryButton>
    </Link>
  );
}
