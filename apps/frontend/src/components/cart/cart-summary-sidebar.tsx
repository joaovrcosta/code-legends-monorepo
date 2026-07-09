"use client";

import Image from "next/image";
import { Check, FileText } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PlanInfo } from "./constants";
import type { PaymentMethodId } from "./cart-payment-methods";
import { CartPayWithCardButton } from "./cart-payment-methods";
import type { UpgradeQuote } from "@/actions/payments/get-upgrade-quote";

interface CartSummarySidebarProps {
  plan: PlanInfo;
  planSlug: string;
  selectedPaymentMethod?: PaymentMethodId | null;
  quote?: UpgradeQuote | null;
  quoteLoading?: boolean;
  checkoutDisabled?: boolean;
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CartSummarySidebar({
  plan,
  planSlug,
  selectedPaymentMethod = null,
  quote = null,
  quoteLoading = false,
  checkoutDisabled = false,
}: CartSummarySidebarProps) {
  const isUpgrade = quote?.kind === "upgrade";
  const amountDueCents = quote?.amountDueCents ?? null;
  const displayTotal =
    amountDueCents != null ? formatBRL(amountDueCents) : plan.price;

  return (
    <div className="lg:sticky lg:top-8 space-y-4">
      <Card className="border-[#25252A] border-[#00C8FF]/30 bg-surface-2 rounded-[20px] overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <FileText size={20} className="text-[#00C8FF]" />
            Resumo
          </h3>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          {quoteLoading ? (
            <p className="text-sm text-[#7e7e89]">Calculando valor...</p>
          ) : null}

          <div className="flex justify-between items-center gap-2 text-sm">
            <span className="flex items-center gap-2 text-[#c4c4cc] min-w-0">
              {plan.icon && (
                <Image
                  src={plan.icon}
                  alt=""
                  width={20}
                  height={20}
                  className="shrink-0"
                />
              )}
              <span className="truncate">{plan.title}</span>
            </span>
            <span
              className={`font-semibold shrink-0 ${isUpgrade ? "text-[#7e7e89] line-through" : "text-white"}`}
            >
              {plan.price}
            </span>
          </div>

          {isUpgrade && quote ? (
            <>
              <div className="flex justify-between items-center gap-2 text-sm">
                <span className="text-[#c4c4cc]">
                  Crédito ({quote.currentPlan.name})
                </span>
                <span className="text-emerald-400 shrink-0">
                  -{formatBRL(quote.breakdown.creditCents)}
                </span>
              </div>
              <p className="text-xs text-[#7e7e89]">
                Upgrade proporcional — {quote.daysRemaining} dias restantes.
                Vencimento mantido em {formatDate(quote.preservedEndsAt)}.
              </p>
            </>
          ) : null}

          <div className="border-t border-[#25252A] pt-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#c4c4cc]">
                {isUpgrade ? "Total do upgrade" : "Total"}
              </span>
              <span className="font-bold text-white">{displayTotal}</span>
            </div>
            {!isUpgrade ? (
              <p className="text-xs text-[#7e7e89]">{plan.installments}</p>
            ) : null}
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

      <div className="flex gap-3 p-4 rounded-[12px] border border-[#25252A] bg-surface-2">
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

      {selectedPaymentMethod === "card" ? (
        <div className="hidden lg:block">
          <CartPayWithCardButton planSlug={planSlug} disabled={checkoutDisabled} />
        </div>
      ) : null}
    </div>
  );
}
