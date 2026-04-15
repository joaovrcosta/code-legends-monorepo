"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { CtaAssinarCursoButton } from "./cta-assinar-curso-button";
import { cn } from "@/lib/utils";

type PlanoSlug = "pro" | "premium";

const FEATURES_DEFAULT = [
  "Certificados de conclusão",
  "Acesso a todos os conteúdos do catálogo",
  "Projetos práticos para o portfólio",
  "Suporte para dúvidas",
  "Eventos e encontros ao vivo",
  "Acompanhamento do seu progresso",
];

export interface CtaAssinarCursoCardProps {
  /** Plano: "pro" ou "premium" */
  planSlug?: PlanoSlug;
  /** Título do card */
  title?: string;
  /** Badge (ex: "ACESSO ANUAL") */
  badge?: string;
  /** Preço principal (ex: "R$ 197,00") */
  price?: string;
  /** Preço parcelado (ex: "ou 12x de R$ 19,75") */
  priceInstallments?: string;
  /** Lista de benefícios */
  features?: string[];
  /** Texto do botão CTA */
  ctaLabel?: string;
  className?: string;
}

export function CtaAssinarCursoCard({
  planSlug = "pro",
  title = "Code Legends PRO",
  badge = "ACESSO ANUAL",
  price = "R$ 197,00",
  priceInstallments = "ou 12x de R$ 19,75",
  features = FEATURES_DEFAULT,
  ctaLabel = "Assinar o curso",
  className,
}: CtaAssinarCursoCardProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 border border-[#25252A] rounded-[20px] bg-surface-2 p-6 flex flex-col gap-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {badge && (
          <span className="text-xs font-medium text-[#7e7e89] bg-[#25252A] px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-2xl font-bold text-white">{price}</p>
        {priceInstallments && (
          <p className="text-sm text-[#7e7e89]">{priceInstallments}</p>
        )}
      </div>

      {features.length > 0 && (
        <ul className="flex flex-col gap-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#c4c4cc]">
              <span className="flex-shrink-0 w-5 h-5 rounded-md bg-[#25252A] border border-[#00C8FF]/50 flex items-center justify-center mt-0.5">
                <Check size={12} weight="bold" className="text-[#00C8FF]" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <CtaAssinarCursoButton planSlug={planSlug} showArrow>
        {ctaLabel}
      </CtaAssinarCursoButton>
    </div>
  );
}
