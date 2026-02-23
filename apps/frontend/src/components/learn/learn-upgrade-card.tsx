"use client";

import { Check, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

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
    <div className="w-full min-w-0 border border-[#25252A] rounded-[20px] bg-[#1a1a1e] p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold text-white">Code Legends PRO</h3>
        <span className="text-xs font-medium text-[#7e7e89] bg-[#25252A] px-2.5 py-1 rounded-full">
          ACESSO ANUAL
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-2xl font-bold text-white">R$ 197,00</p>
        <p className="text-sm text-[#7e7e89]">ou 12x de R$ 19,75</p>
      </div>

      <ul className="flex flex-col gap-3">
        {FEATURES.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[#c4c4cc]">
            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-[#25252A] border border-[#00C8FF]/50 flex items-center justify-center mt-0.5">
              <Check size={12} weight="bold" className="text-[#00C8FF]" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/cart/pro"
        className="w-full h-[48px] rounded-full bg-blue-gradient-500 flex items-center justify-center gap-2 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Faça um upgrade
        <ArrowUpRight size={18} weight="bold" />
      </Link>
    </div>
  );
}
