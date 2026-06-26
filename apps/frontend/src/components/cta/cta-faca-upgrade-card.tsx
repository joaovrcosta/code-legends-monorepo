"use client";

import { CtaAssinarCursoButton } from "./cta-assinar-curso-button";
import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react/dist/ssr";

type PlanoSlug = "pro" | "premium";

const DEFAULT_FEATURES = [
  "Acesso a todos os conteúdos do catálogo",
  "Certificados ilimitados",
  "Mentorias de carreira",
  "Vagas de empregos de parceiros",
];

export interface CtaFacaUpgradeCardProps {
  planSlug?: PlanoSlug;
  title?: string;
  description?: string | null;
  features?: string[];
  ctaLabel?: string;
  className?: string;
}

export function CtaFacaUpgradeCard({
  planSlug = "pro",
  title = "Faça um upgrade",
  description = null,
  features = DEFAULT_FEATURES,
  ctaLabel = "Quero assinar",
  className,
}: CtaFacaUpgradeCardProps) {
  return (
    <div
      className={cn(
        "relative z-[100] w-full rounded-[20px]",
        "shadow-[0_0_32px_rgba(0,200,255,0.12),0_0_64px_rgba(0,200,255,0.06)]",
        className,
      )}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-[20px]",
          "border border-[#25252A] border-[#00C8FF]/20 bg-surface-2",
        )}
      >
      {/* Header com fundo escuro e imagem do raio */}
      <div
        className="relative min-h-[100px] flex items-center px-6 py-5 rounded-t-[20px] bg-black"
        style={{
          backgroundImage: "url(/background-plan.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "right center",
        }}
      >
        <span className="text-white text-lg font-semibold relative z-10">{title}</span>
      </div>

      <div className="p-6">
        {description != null && description !== "" && (
          <p className="text-sm text-[#C4C4CC] mb-4">{description}</p>
        )}
        <ul className="text-sm text-[#C4C4CC] flex flex-col gap-2">
          {features.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check size={16} weight="bold" className="text-[#00C8FF] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        {ctaLabel && (
          <div className="mt-6 w-full">
            <CtaAssinarCursoButton planSlug={planSlug} showArrow className="w-full [&_button]:w-full [&_button]:h-[52px]">
              {ctaLabel}
            </CtaAssinarCursoButton>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
