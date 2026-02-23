"use client";

import { CtaAssinarCursoButton } from "./cta-assinar-curso-button";
import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react/dist/ssr";

type PlanoSlug = "pro" | "premium";

const DEFAULT_DESCRIPTION =
  "Aprofunde seus conhecimentos e desenvolva habilidades essenciais para o mercado de trabalho. Pratique com projetos reais, faça avaliações e obtenha certificados.";

const DEFAULT_FEATURES = [
  "Acesso a todos os conteúdos do catálogo",
  "Certificados ilimitados",
  "Mentorias de carreira",
  "Vagas de empregos de parceiros",
];

export interface CtaFacaUpgradeCardProps {
  /** Plano do carrinho: "pro" ou "premium". Default: "pro" */
  planSlug?: PlanoSlug;
  /** Título do card */
  title?: string;
  /** Descrição */
  description?: string;
  /** Lista de benefícios */
  features?: string[];
  /** Texto do botão CTA. Se não informado, o botão não é exibido */
  ctaLabel?: string;
  className?: string;
}

export function CtaFacaUpgradeCard({
  planSlug = "pro",
  title = "Faça um upgrade",
  description = DEFAULT_DESCRIPTION,
  features = DEFAULT_FEATURES,
  ctaLabel = "Fazer upgrade",
  className,
}: CtaFacaUpgradeCardProps) {
  return (
    <div
      className={cn(
        "bg-[#1A1A1E] border border-[#25252A] rounded-[20px] w-full p-6",
        "shadow-[0_0_32px_rgba(0,200,255,0.12),0_0_64px_rgba(0,200,255,0.06)]",
        "border-[#00C8FF]/20",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white text-lg font-semibold">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-sm text-[#C4C4CC]">{description}</p>
      </div>
      <ul className="text-sm text-[#C4C4CC] flex flex-col gap-2">
        {features.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check size={16} weight="bold" className="text-[#00C8FF] flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      {ctaLabel && (
        <div className="mt-4">
          <CtaAssinarCursoButton planSlug={planSlug} showArrow>
            {ctaLabel}
          </CtaAssinarCursoButton>
        </div>
      )}
    </div>
  );
}
