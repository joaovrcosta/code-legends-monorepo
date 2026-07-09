"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanInfo } from "./constants";
import { CartHeader } from "./cart-header";
import { CartItemsSection } from "./cart-items-section";
import { CartCheckoutAccordion } from "./cart-checkout-accordion";
import { CartSummarySidebar } from "./cart-summary-sidebar";
import type { CartMeusDadosFormHandle } from "./cart-meus-dados-form";
import type { PaymentMethodId } from "./cart-payment-methods";
import {
  getUpgradeQuote,
  type UpgradeQuote,
} from "@/actions/payments/get-upgrade-quote";

interface CartContentProps {
  planSlug: string;
  plan: PlanInfo;
}

export function CartContent({ planSlug, plan }: CartContentProps) {
  const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);
  const accordionRef = useRef<HTMLDivElement>(null);
  const meusDadosFormRef = useRef<CartMeusDadosFormHandle | null>(null);
  const [meusDadosValid, setMeusDadosValid] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId | null>(null);
  const [quote, setQuote] = useState<UpgradeQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadQuote() {
      setQuoteLoading(true);
      setQuoteError(null);
      const result = await getUpgradeQuote(planSlug);
      if (cancelled) return;

      if (!result.ok) {
        setQuote(null);
        setQuoteError(result.message);
      } else {
        setQuote(result);
      }
      setQuoteLoading(false);
    }

    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [planSlug]);

  const handleAvançar = async () => {
    if (!accordionValue) {
      setAccordionValue("dados");
      setTimeout(() => {
        accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return;
    }

    if (accordionValue === "dados") {
      await meusDadosFormRef.current?.advanceToPayment();
      return;
    }

    accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const checkoutBlocked = Boolean(quoteError) && !quoteLoading;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <CartHeader />

      {checkoutBlocked ? (
        <div className="mb-6 rounded-[12px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p>{quoteError}</p>
          <Link
            href="/account/purchases"
            className="mt-2 inline-block text-[#00C8FF] hover:underline"
          >
            Ver minha assinatura
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <CartItemsSection plan={plan} />

          <CartCheckoutAccordion
            planSlug={planSlug}
            value={accordionValue}
            onValueChange={setAccordionValue}
            accordionRef={accordionRef}
            meusDadosFormRef={meusDadosFormRef}
            onMeusDadosValidityChange={setMeusDadosValid}
            selectedPaymentMethod={selectedPaymentMethod}
            onSelectedPaymentMethodChange={setSelectedPaymentMethod}
            checkoutDisabled={checkoutBlocked}
          />

          <Button
            type="button"
            onClick={handleAvançar}
            disabled={
              checkoutBlocked ||
              (accordionValue === "dados" && !meusDadosValid)
            }
            className={cn(
              "w-full h-14 rounded-full text-base font-semibold",
              "bg-blue-gradient-500 hover:opacity-90 border-0"
            )}
          >
            Avançar
          </Button>
        </div>

        <div className="lg:col-span-1">
          <CartSummarySidebar
            plan={plan}
            planSlug={planSlug}
            selectedPaymentMethod={selectedPaymentMethod}
            quote={quote}
            quoteLoading={quoteLoading}
            checkoutDisabled={checkoutBlocked}
          />
        </div>
      </div>
    </div>
  );
}
