"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

type PlanoSlug = "pro" | "premium";

export interface CtaAssinarCursoLinkProps {
  /** Plano do carrinho: "pro" ou "premium". Default: "pro" */
  planSlug?: PlanoSlug;
  /** Texto do link */
  children?: React.ReactNode;
  /** Mostrar ícone de seta */
  showArrow?: boolean;
  className?: string;
}

const DEFAULT_LABEL = "Assinar o curso";

export function CtaAssinarCursoLink({
  planSlug = "pro",
  children = DEFAULT_LABEL,
  showArrow = true,
  className,
}: CtaAssinarCursoLinkProps) {
  const href = `/cart/${planSlug}`;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-semibold text-[#00c8ff] hover:text-[#35BED5] hover:underline transition-colors",
        className
      )}
    >
      {children}
      {showArrow && <ArrowUpRight size={16} weight="bold" />}
    </Link>
  );
}
