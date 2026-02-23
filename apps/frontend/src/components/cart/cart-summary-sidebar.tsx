"use client";

import { Check, FileText } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PlanInfo } from "./constants";

interface CartSummarySidebarProps {
  plan: PlanInfo;
}

export function CartSummarySidebar({ plan }: CartSummarySidebarProps) {
  return (
    <div className="lg:sticky lg:top-8 space-y-4">
      <Card className="border-[#25252A] border-[#00C8FF]/30 bg-[#1a1a1e] rounded-[20px] overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <FileText size={20} className="text-[#00C8FF]" />
            Resumo
          </h3>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#c4c4cc]">{plan.title}</span>
            <span className="font-semibold text-white">{plan.price}</span>
          </div>
          <div className="border-t border-[#25252A] pt-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#c4c4cc]">Total</span>
              <span className="font-bold text-white">{plan.price}</span>
            </div>
            <p className="text-xs text-[#7e7e89]">{plan.installments}</p>
          </div>
          <button
            type="button"
            className="w-full py-2.5 rounded-lg border border-dashed border-[#25252A] text-sm text-[#7e7e89] hover:border-[#00C8FF]/50 hover:text-[#c4c4cc] transition-colors"
          >
            Aplicar cupom de desconto
          </button>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Cartão", "PIX", "Boleto"].map((m) => (
              <span
                key={m}
                className="px-3 py-1.5 rounded-lg bg-[#25252A] text-xs text-[#c4c4cc]"
              >
                {m}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 p-4 rounded-[12px] border border-[#25252A] bg-[#1a1a1e]">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00C8FF]/20 flex items-center justify-center">
          <Check size={18} weight="bold" className="text-[#00C8FF]" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Garantia de 15 dias</p>
          <p className="text-xs text-[#7e7e89] mt-0.5">
            Experimente. Se não gostar, devolvemos seu dinheiro.
          </p>
        </div>
      </div>
    </div>
  );
}
