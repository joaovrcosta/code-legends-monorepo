"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanInfo } from "./constants";
import { CartHeader } from "./cart-header";
import { CartItemsSection } from "./cart-items-section";
import { CartCheckoutAccordion } from "./cart-checkout-accordion";
import { CartSummarySidebar } from "./cart-summary-sidebar";
import type { CartMeusDadosFormHandle } from "./cart-meus-dados-form";
import type { PaymentMethodId } from "./cart-payment-methods";

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

    // Em "pagamento", o avanço/submit depende do método de pagamento (fica dentro do bloco)
    accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <CartHeader />

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
          />

          <Button
            type="button"
            onClick={handleAvançar}
            disabled={accordionValue === "dados" && !meusDadosValid}
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
          />
        </div>
      </div>
    </div>
  );
}
