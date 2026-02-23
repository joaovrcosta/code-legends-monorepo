"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { CtaAssinarCursoButton } from "@/components/cta";

const FEATURES = [
  "Certificados de conclusão",
  "Acesso a todos os conteúdos do catálogo",
  "Projetos práticos para o portfólio",
  "Suporte para dúvidas",
  "Eventos e encontros ao vivo",
  "Acompanhamento do seu progresso",
];

export function LearnUpgradeCard() {
  return (
    <div
      className="w-full min-w-0 overflow-hidden rounded-[20px] border border-[#25252A] border-[#00C8FF]/20 bg-[#1a1a1e] shadow-[0_0_32px_rgba(0,200,255,0.12),0_0_64px_rgba(0,200,255,0.06)]"
    >
      {/* Header com imagem do raio */}
      <div
        className="relative flex min-h-[100px] items-center justify-between gap-2 px-6 py-5 rounded-t-[20px] bg-black"
        style={{
          backgroundImage: "url(/background-plan.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "right center",
        }}
      >
        <h3 className="relative z-10 text-lg font-semibold text-white">Code Legends PRO</h3>
        <span className="relative z-10 text-xs font-medium text-[#7e7e89] bg-[#25252A] px-2.5 py-1 rounded-full shrink-0">
          ACESSO ANUAL
        </span>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-0.5">
          <p className="text-2xl font-bold text-white">R$ 197,00</p>
          <p className="text-sm text-[#7e7e89]">ou 12x de R$ 19,75</p>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-[#c4c4cc]">
          {FEATURES.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check size={16} weight="bold" className="text-[#00C8FF] flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-1 w-full">
          <CtaAssinarCursoButton
            planSlug="pro"
            showArrow
            className="w-full [&_button]:w-full [&_button]:h-[52px]"
          >
            Faça um upgrade
          </CtaAssinarCursoButton>
        </div>
      </div>
    </div>
  );
}
